"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { Alert, Avatar, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Skeleton, TextField, Typography } from "@mui/material";
import PageHeader from "@/components/page-header";
import PageContent from "@/components/page-content";
import { Add, Delete, Euro, Pause, Person, RequestQuote } from "@mui/icons-material";
import MenuIcon from '@mui/icons-material/Menu';
import { Fragment, Suspense, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { SignUp } from "@/components/signup";
import { SignIn } from "@/components/signin/signin";
import { StoreContext } from "@/store";
import { Welcome } from "@/components/welcome";
import { useSearchParams } from "next/navigation";
import { Tristate } from "@/app/components/tristate/tristate";
import getDescription from "@/invoice-utils";
import { NoResults } from "./components/no-results";
import { CircularProgress } from "@/node_modules/@mui/material/index";
import axios from "axios";
import { formatCurrency } from "@/i18n";

const NotAuthenticatedHome = () => {
  return (
    <>
      <Welcome />
      <PageContent sx={{ mt: '2em' }}>
        <Typography variant="h4" sx={{ textAlign: 'center', fontSize: '1.5em', fontWeight: 'bold' }}>
          Crea una cuenta
        </Typography>
        <SignUp />
      </PageContent>
      <Box sx={{ mb: 25 }}></Box>
    </>
  )
}

interface EditRentAmountDialogProps {
  tenant: any;
  open: boolean;
  onClose: (saved?: Boolean) => void;
}

function EditRentAmountDialog({ tenant, open, onClose }: EditRentAmountDialogProps) {
  const defaultPrice = tenant.subscriptions?.data[0].plan.amount_decimal / 100;
  const [rent, setRent] = useState(defaultPrice);
  const [processingSaveRequest, setProcessingSaveRequest] = useState(false);
  
  const handleSave = async () => {
    try {
      setProcessingSaveRequest(true);
      await axios.post(`/api/tenants/${tenant.id}`, {
        rent: rent
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      onClose(true);
      alert('¡Actualizado!')
    }
    catch (e) {
      alert('Error al guardar los cambios.');
    }
    finally {
      setProcessingSaveRequest(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => { onClose(false) }}
      PaperProps={{
        component: 'form',
        onSubmit: (event: Event) => {
          event.preventDefault();
          handleSave();
        },
      }}
    >
      <DialogTitle>Modificar importe de la renta</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Introduce el nuevo importe de la renta. Este cambio se hará efectivo en el próximo cobro.
        </DialogContentText>
        <TextField
          autoFocus
          required
          name="amount"
          label="Importe mensual"
          type="number"
          fullWidth
          variant="standard"
          onChange={(event) => setRent(parseFloat(event.target.value))}
          value={rent}
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={processingSaveRequest} onClick={() => onClose(false)}>Cancel</Button>
        <Button disabled={processingSaveRequest} type="submit">Actualizar</Button>
      </DialogActions>
    </Dialog>
  );
}

const getTenantDescription = (tenant: any, invoices?: any[]) => {
  let description: JSX.Element[] = [];
  if (tenant.subscriptions?.data?.length > 0) {
    const subscription = tenant.subscriptions.data[0];
    
    // STATUS INFO
    if (subscription.pause_collection) {
      description.push(<Fragment key='status'>Cobro pausado</Fragment>);
    }
    else if (subscription.status === 'trialing') {
      const date = new Date(subscription.trial_end * 1000);
      description.push(<Fragment key='status'>{`Desde ${date.toLocaleDateString()}`}</Fragment>);
    }
    else if (subscription.status === 'active' || subscription.status === 'past_due') {
      description.push(<Fragment key='status'>Cobro activo</Fragment>);
    }
    else {
      description.push(<Fragment key='status'>Cobro {subscription.status}</Fragment>);
    }

    // PRICE INFO
    description.push(<Fragment key='status'>{formatCurrency(subscription.plan.amount_decimal / 100)}/mes</Fragment>);
    
    // PAY DAY INFO
    if (subscription.billing_cycle_anchor_config || subscription.current_period_end) {
      let day = 0;
      if (subscription.billing_cycle_anchor_config) {
        day = subscription.billing_cycle_anchor_config.day_of_month;
      }
      else {
        const date = new Date(subscription.current_period_end * 1000);
        day = date.getDate();
      }

      description.push(<Fragment key='payday'>Cobro el día {day}</Fragment>);
    }

    if (invoices === undefined) {
      description.push(<Skeleton key='pending-payments' variant="text" width={100} sx={{ display: 'inline-block' }}/>);
    }
    else {
      const pendingInvoices = countPendingInvoices(invoices);
      if (pendingInvoices > 0) {
        description.push(<Link key='pending-payments' href={`/payments?tenantId=${tenant.id}`}>{pendingInvoices} facturas pendientes</Link>);
      }
      else {
        description.push(<Link key='pending-payments' href={`/payments?tenantId=${tenant.id}`}>Sin facturas pendientes</Link>);
      }
    }
  }
  else {
    description.push(<Fragment key='no-rent'>Sin alquiler</Fragment>);
  }

  return description.reduce((acc, curr, index) => {
    if (index > 0) acc.push(<Fragment key={`sep-${index}`}> - </Fragment>);
    acc.push(curr);
    return acc;
  }, [] as JSX.Element[]);
}

const countPendingInvoices = (invoices: any[]) => {
  return invoices.map((invoice) => {
    return getDescription(invoice).isPending
  }, invoices).filter((isPending) => isPending).length;
}

interface TenantInfoProps {
  tenant: any;
  invoices?: any[];
  onPauseCollection?: () => void;
  onRentUpdated: () => void;
}

const TenantInfo = ({ tenant, invoices, onPauseCollection, onRentUpdated }: TenantInfoProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const [processingPauseRequest, setProcessingPauseRequest] = useState(false);
  const [openEditRentAmountDialog, setOpenEditRentAmountDialog] = useState(false);
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onPauseHandler = async () => {
    setProcessingPauseRequest(true);
    try {
      await axios.post(`/api/tenants/${tenant.id}/pause`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (onPauseCollection) {
        onPauseCollection();
      }
      alert('¡Hecho!')
      handleClose();
    }
    catch (e) {
      alert('Error al pausar el alquiler.');
    }
    setProcessingPauseRequest(false);
  }

  return <>
    <EditRentAmountDialog
      tenant={tenant}
      open={openEditRentAmountDialog}
      onClose={(saved) => {
        setOpenEditRentAmountDialog(false);
        if (saved) {
          onRentUpdated();
        }
      }}
    />
    <ListItem
      disableGutters={true}
      secondaryAction={
        <>
          <IconButton
            onClick={handleClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
          >
            <MenuItem
              component={Link}
              href={`/tenants/${tenant.id}/oneoff`}
            >
              <ListItemIcon>
                <RequestQuote fontSize="small" />
              </ListItemIcon>
              <ListItemText>Hacer cobro único</ListItemText>
            </MenuItem>
            <MenuItem disabled={processingPauseRequest} onClick={onPauseHandler}>
              <ListItemIcon>
                <Pause fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                { tenant.subscriptions?.data[0].pause_collection ? 'Reanudar alquiler' : 'Pausar alquiler'}
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); setOpenEditRentAmountDialog(true) }}>
              <ListItemIcon>
                <Euro fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cambiar importe</ListItemText>
            </MenuItem>
          </Menu>
        </>
      }
    >
      <ListItemAvatar>
        <Avatar>
          <Person />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={tenant.name}
        secondary={getTenantDescription(tenant, invoices)}
      />
    </ListItem>
  </>
}

const AuthenticatedHome = () => {
  // [TODO] Implement pagination.
  const [tenants, setTenants] = useState<any[] | null>(null);
  const [invoices, setInvoices] = useState<{ [key: string]: any[] }>({});
  const params = useSearchParams();

  const loadTenants = async () => {
    const response = await fetch('/api/tenants', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();

    setTenants(data.data);

    const promises = data.data.map((tenant: any) => {
      return loadInvoicesForTenant(tenant.id);
    });

    const responses = await Promise.all(promises);
    const newInvoices: { [key: string]: any[] } = {};

    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const json = await response.json();
      newInvoices[json.data[0].customer] = json.data;
    }
    
    setInvoices(newInvoices);
  }

  const loadInvoicesForTenant = async (tenantId: string) => {
    const query = new URLSearchParams({
      tenantId
    }).toString();
    return fetch(`/api/tenants/invoices?${query}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
  };

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (params.get('newTenant')) {
      const interval = setInterval(() => {
        loadTenants();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [params]);

  const onPauseCollection = () => {
    loadTenants();
  }

  return (
    <>
      <PageHeader title="Inquilinos">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          LinkComponent={Link}
          href="/tenants/add"
        >
          Nuevo inquilino
        </Button>
      </PageHeader>

      <PageContent>
        {params.get('newTenant') && (
          <Alert severity="success" sx={{ mb: 1 }}>
            El inquilino ha sido añadido correctamente. Puede tardar unos segundos en aparecer en esta lista.
            <Box sx={{ width: '20px', display: 'inline-block', verticalAlign: 'center' }}>
              <CircularProgress sx={{ verticalAlign: 'center' }} size={16} />
            </Box>
          </Alert>
        )}
        <Tristate observed={tenants}>
          {/** When loading... */} 
          <Skeleton variant="rectangular" width="100%" height={200} />
          {/** When there are no tenants... */}
          <NoResults>
            No hay ningún inquilino.
          </NoResults>
          {/** When there are tenants... */}
          <List dense={false}>
            {tenants?.map((tenant) => (
              <TenantInfo
                key={tenant.id}
                tenant={tenant}
                invoices={invoices[tenant.id]}
                onPauseCollection={onPauseCollection}
                onRentUpdated={loadTenants}
              />
            ))}
          </List>
        </Tristate>
      </PageContent>
    </>
  )
}


export default function Tenants() {
  const { state: { token, loadingToken } } = useContext(StoreContext);
  if (loadingToken) {
    return (
      <></>
    );
  }
  return (
    <>
      { token ? <Suspense><AuthenticatedHome /></Suspense> : <NotAuthenticatedHome /> }
    </>
  );
}