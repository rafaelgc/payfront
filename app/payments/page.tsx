"use client";
import PageContent from "@/components/page-content";
import PageHeader from "@/components/page-header";
import { Alert, Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useRouter, useSearchParams } from "next/navigation";
import MenuIcon from '@mui/icons-material/Menu';
import LinkIcon from '@mui/icons-material/Link';
import Link from "next/link";
import { Tristate } from "@/tristate";
import getDescription from "@/invoice-utils";

// TODO Offtopic: enviar notificacion cuando recibimos notificacion de refund.

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
  return DateTime.fromSeconds(unix).toFormat('dd/MM/yyyy');
}

interface InvoiceRowProps {
  invoice: any;
}

const InvoiceRow = ({ invoice }: InvoiceRowProps) => {
  const [paymentLinkDialogOpen, setPaymentLinkDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <PaymentLinkDialog
        invoice={invoice}
        open={paymentLinkDialogOpen}
        handleClose={() => setPaymentLinkDialogOpen(false)}
      />
      <TableRow key={invoice.id}>
        <TableCell>{invoice.amount_due / 100} €</TableCell>
        <TableCell>
          <Tooltip title={getDescription(invoice).message}>
            <ButtonBase>
              <PaymentStatus invoice={invoice} />
            </ButtonBase>
          </Tooltip>
        </TableCell>
        <TableCell>{formatUnix(invoice.created)}</TableCell>
        <TableCell>
          <Link href={`/payments?tenantId=${invoice.customer}`}>{invoice.customer_name}</Link>
        </TableCell>
        <TableCell>{invoice.description}</TableCell>
        <TableCell>
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
            <MenuItem onClick={() => setPaymentLinkDialogOpen(true)}>
              <ListItemIcon>
                <LinkIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ver enlace de pago</ListItemText>
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>
    </>
  )
}

interface PaymentStatusProps {
  invoice: any;
}

const PaymentStatus = ({ invoice, ...other }: PaymentStatusProps) => {
  // TODO: consider draft state and inform the user about what it means.
  // Color code:
  // - green: paid
  // - yellow: invoice open and payment processing
  // - red: invoice open and payment failed or refunded.
  const { message, color } = getDescription(invoice);

  return (
    <Box {...other} sx={{
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      bgcolor: color,
    }}></Box>
  );
}

export default function Payments() {
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

  // TODO: implement pagination in invoice list.

  return (
    <>
      <PageHeader title={getTitle()}></PageHeader>

      <PageContent>
        <Tristate observed={invoices}>
          {/** When loading... */} 
          <Skeleton variant="rectangular" width="100%" height={200} />
          {/** When there are no invoices... */}
          <Typography variant="body1">No hay ningún pago registrado.</Typography>
          {/** When there are invoices... */}
          <Table>
            <TableHead>
              <TableRow>
              <TableCell>Importe</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Inquilino</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices?.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
              ))}
            </TableBody>
          </Table>
        </Tristate>
        

      </PageContent>
    </>
  );
}