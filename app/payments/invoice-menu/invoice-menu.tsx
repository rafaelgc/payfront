import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, TextField } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import LinkIcon from '@mui/icons-material/Link';
import { useState } from "react";
import Link from "next/link";
import { PersonSearch } from "@mui/icons-material";

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

interface InvoiceMenuProps {
  invoice: any;
  showTenantPaymentsButton: boolean;
}

export const InvoiceMenu = ({ invoice, showTenantPaymentsButton }: InvoiceMenuProps) => {
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
      {showTenantPaymentsButton &&
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
      }
      <MenuItem onClick={() => setPaymentLinkDialogOpen(true)}>
        <ListItemIcon>
          <LinkIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Ver enlace de pago</ListItemText>
      </MenuItem>
    </Menu>
  </>
}