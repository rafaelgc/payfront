"use client";
import PageContent from "@/components/page-content";
import PageHeader from "@/components/page-header";
import { Alert, Avatar, Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useRouter, useSearchParams } from "next/navigation";
import MenuIcon from '@mui/icons-material/Menu';
import LinkIcon from '@mui/icons-material/Link';
import Link from "next/link";
import { Tristate } from "@/tristate";
import getDescription from "@/invoice-utils";
import { NoResults } from "../components/no-results";
import { Brightness1, Person, PersonSearch } from "@mui/icons-material";

// TODO Offtopic: enviar notificacion cuando recibimos notificacion de refund.

interface InvoiceMenuProps {
  invoice: any;
}

const InvoiceMenu = ({ invoice }: InvoiceMenuProps) => {
  const [paymentLinkDialogOpen, setPaymentLinkDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  return <>
    <PaymentLinkDialog
      invoice={invoice}
      open={paymentLinkDialogOpen}
      handleClose={() => setPaymentLinkDialogOpen(false)}
    />
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
        href={`/payments?tenantId=${invoice.customer}`}
        onClick={handleClose}
      >
        <ListItemIcon>
          <PersonSearch fontSize="small" />
        </ListItemIcon>
        <ListItemText>Ver pagos de este inquilino</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => setPaymentLinkDialogOpen(true)}>
        <ListItemIcon>
          <LinkIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Ver enlace de pago</ListItemText>
      </MenuItem>
    </Menu>
  </>
}

interface InvoiceItemProps {
  invoice: any;
}

const InvoiceItem = ({ invoice }: InvoiceItemProps) => {
  const { color } = getDescription(invoice);
  return <ListItem
    key={invoice.id}
    secondaryAction={
      <InvoiceMenu invoice={invoice} />
    }
  >
    <ListItemAvatar>
      <Tooltip title={getDescription(invoice).message}>
        <Avatar sx={{ bgcolor: 'transparent', color: color }}>
          <Brightness1 />
        </Avatar>
      </Tooltip>
    </ListItemAvatar>
    <ListItemText
      primary={`${invoice.amount_due / 100} € - ${invoice.customer_name}`}
      secondary={`${formatUnix(invoice.created)}` + (invoice.description ? ` - ${invoice.description}` : '')}
    />
  </ListItem>
}

interface PaymentLinkDialogProps {
  open: boolean;
  handleClose: () => void;
  invoice: any;
}

const PaymentLinkDialog = ({ open, handleClose, invoice }: PaymentLinkDialogProps) => {
  return (
    <Dialog
      fullScreen={false}
      open={open}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">
        {"Enlace de pago"}
      </DialogTitle>
      <DialogContent>
        {invoice.status === 'draft' ? (
          <Alert severity="info">
            Mandaremos la factura a tu inquilino en 1 hora aproximadamente. Hasta entonces, no estará disponible el enlace de pago.
          </Alert>
        ) : (
          <>
            <DialogContentText>
              Si tu inquilino todavía no ha autorizado el pago, puedes enviarle este enlace para
              que lo haga.
            </DialogContentText>
            <TextField
              fullWidth
              value={invoice.hosted_invoice_url}
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          const baseLink = 'https://wa.me/?text=';
          const message = `Hola, para autorizar el pago, visita este enlace: ${invoice.hosted_invoice_url}`;
          window.open(
            `${baseLink}${encodeURIComponent(message)}`,
          );
        }}>
          Enviar por WhatsApp
        </Button>
        <Button onClick={handleClose} autoFocus>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const formatUnix = (unix: number) => {
  return DateTime.fromSeconds(unix).toFormat('dd/MM/yy');
}

interface InvoiceRowProps {
  invoice: any;
  dense: boolean;
}

const InvoiceRow = ({ invoice }: InvoiceRowProps) => {
  return (
    <>
      <TableRow key={invoice.id}>
        <TableCell>
          <Tooltip title={getDescription(invoice).message}>
            <ButtonBase>
              <PaymentStatus invoice={invoice} />
            </ButtonBase>
          </Tooltip>
        </TableCell>
        <TableCell>{invoice.amount_due / 100} €</TableCell>
        <TableCell>{formatUnix(invoice.created)}</TableCell>
        <TableCell>
          <Link href={`/payments?tenantId=${invoice.customer}`}>{invoice.customer_name}</Link>
        </TableCell>
        <TableCell>
          {invoice.description}
        </TableCell>
        <TableCell>
          <InvoiceMenu invoice={invoice} />
        </TableCell>
      </TableRow>
    </>
  )
}

interface PaymentStatusProps {
  invoice: any;
}

const PaymentStatus = ({ invoice, ...other }: PaymentStatusProps) => {
  const { color } = getDescription(invoice);

  return (
    <Box {...other} sx={{
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      bgcolor: color,
    }}></Box>
  );
}

function Payments() {
  const [invoices, setInvoices] = useState<any[] | null>(null);

  const params = useSearchParams();

  const loadInvoices = async () => {
    const query = new URLSearchParams({
      tenantId: params.get('tenantId') ?? '',
    }).toString();

    const response = await fetch(`/api/tenants/invoices?${query}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });

    const data = await response.json();
    setInvoices(data.data);
  };

  useEffect(() => {
    loadInvoices();
  }, [params]);

  const getTitle = () => {
    if (params.get('tenantId') && invoices) {
      return `Pagos de ${invoices[0].customer_name}`;
    }
    return 'Pagos';
  }

  const theme = useTheme();
  const dense = useMediaQuery(theme.breakpoints.down('md'));

  // TODO: implement pagination in invoice list.

  return (
    <>
      <PageHeader title={getTitle()}></PageHeader>

      <PageContent>
        <Tristate observed={invoices}>
          {/** When loading... */} 
          <Skeleton variant="rectangular" width="100%" height={200} />
          {/** When there are no invoices... */}
          <NoResults>
            No hay ningún pago registrado todavía.
          </NoResults>
          {/** When there are invoices... */}
          {!dense ? (
            <Table size={dense ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                <TableCell></TableCell>
                <TableCell>Importe</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Inquilino</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices?.map((invoice) => (
                  <InvoiceRow key={invoice.id} invoice={invoice} dense={dense} />
                ))}
              </TableBody>
            </Table>
          ) : (
            <List>
              {invoices?.map((invoice) => (
                <InvoiceItem key={invoice.id} invoice={invoice} />
              ))}
            </List>
          )}
        </Tristate>
      </PageContent>
    </>
  );
}

export default function SuspensedPayments() {
  return (
    <Suspense>
      <Payments />
    </Suspense>
  );
}