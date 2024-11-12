import getDescription from "@/invoice-utils";
import { Avatar, Button, Dialog, DialogActions, DialogContent, ListItem, ListItemAvatar, ListItemText, Tooltip } from "@mui/material";
import { useState } from "react";
import { InvoiceMenu } from "@/app/payments/invoice-menu/invoice-menu";
import { Brightness1 } from "@mui/icons-material";
import { DateTime } from "luxon";

const formatUnix = (unix: number) => {
  return DateTime.fromSeconds(unix).toFormat('dd/MM/yy');
}

interface InvoiceStatusDialogProps {
  open: boolean;
  handleClose: () => void;
  text: string;
}

const InvoiceStatusDialog = ({ open, handleClose, text }: InvoiceStatusDialogProps) => {
  return (
    <Dialog
      fullScreen={false}
      open={open}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogContent>
        {text}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}


interface InvoiceItemProps {
  invoice: any;
  showTenantPaymentsButton: boolean;
}

export const InvoiceItem = ({ invoice, showTenantPaymentsButton }: InvoiceItemProps) => {
  const { color, message } = getDescription(invoice);
  const [dialogOpen, setDialogOpen] = useState(false);
  return <>
    <InvoiceStatusDialog
      open={dialogOpen}
      handleClose={() => setDialogOpen(false)}
      text={message}
    ></InvoiceStatusDialog>
    <ListItem
      disableGutters={true}
      key={invoice.id}
      secondaryAction={
        <InvoiceMenu invoice={invoice} showTenantPaymentsButton={showTenantPaymentsButton} />
      }
    >
      <ListItemAvatar onClick={() => setDialogOpen(true)}>
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
  </>
}