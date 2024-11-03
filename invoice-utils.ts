import { DateTime } from "luxon";

export default function getDescription(invoice: any) {
    if (invoice.status === 'draft') {
      if (!invoice.automatically_finalizes_at) {
        // I'm not sure when this happens, but it happens
        return {
          message: 'Esta factura no se cobrará.',
          color: '#56F000',
          isPending: false,
        }
      }
      console.log(invoice)
      const datetime = DateTime.fromSeconds(invoice.automatically_finalizes_at);
      // If the date is today, we should show just the time.
      let formatted = `el ` + datetime.toFormat('dd/MM/yyyy HH:mm');
      if (datetime.toFormat('dd/MM/yyyy') === DateTime.now().toFormat('dd/MM/yyyy')) {
        formatted = `a las ` + datetime.toFormat('HH:mm');
      }

      return {
        message: `El pago está en estado "Borrador". Tu inquilino recibirá el email de autorización ${formatted}.`,
        color: '#A4ABB6',
        isPending: true,
      };
    }
    else if (invoice.status === 'paid') {
      if (invoice.payment_intent?.latest_charge?.amount_refunded > 0) {
        return {
          message: 'El pago se ha devuelto.',
          color: '#FF3838',
          isPending: true,
        };
      }
      return {
        message: 'El pago se ha realizado correctamente.',
        color: '#56F000',
        isPending: false,
      };
    }
    else if (invoice.status === 'open') {
      if (invoice.attempts === 0) {
        return {
          message: 'El pago se está procesando.',
          color: '#2DCCFF',
          isPending: true,
        };
      }
      else {
        if (invoice.payment_intent?.status === 'processing') {
          return {
            message: 'Estamos procesando el pago.',
            color: '#2DCCFF',
            isPending: true,
          };
        }
        if (invoice.payment_intent?.status === 'requires_payment_method') {
          return {
            message: `El inquilino parece no haber aceptado todavía el adeudo SEPA. ${invoice.payment_intent.status}:${invoice.payment_intent.last_payment_error?.message}`,
            color: '#FF3838',
            isPending: true,
          };
        }
        return {
          // ie: payment_intent.status=requires_action 
          message: `No hemos conseguido cobrar el recibo. ${invoice.payment_intent.status}:${invoice.payment_intent.last_payment_error?.message}`,
          color: '#FF3838',
          isPending: true,
        };
      }
    }
    else {
      return {
        message: `Estado desconocido. ${invoice.status}:${invoice.payment_intent?.status}`,
        color: 'grey',
        isPending: true,
      };
    }
  }

  export const getMinimumChargeAmount = () => 0.5;