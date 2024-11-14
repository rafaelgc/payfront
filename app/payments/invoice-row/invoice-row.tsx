import getDescription from "@/invoice-utils";
import { Box, ButtonBase, TableCell, TableRow, Tooltip } from "@mui/material";
import { DateTime } from "luxon";
import Link from "next/link";
import { InvoiceMenu } from "@/app/payments/invoice-menu/invoice-menu";
import { Invoice } from "@/app/types/invoice";
import { formatCurrency } from "@/i18n";

const formatUnix = (unix: number) => {
  return DateTime.fromSeconds(unix).toFormat('dd/MM/yy');
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

interface InvoiceRowProps {
  invoice: Invoice;
  showTenantPaymentsButton: boolean;
}

export const InvoiceRow = ({ invoice, showTenantPaymentsButton }: InvoiceRowProps) => {
  return (
    <>
      <TableRow key={invoice.id} data-testid="invoice-row">
        <TableCell>
          <Tooltip title={getDescription(invoice).message}>
            <ButtonBase>
              <PaymentStatus invoice={invoice} />
            </ButtonBase>
          </Tooltip>
        </TableCell>
        <TableCell data-testid="price">{formatCurrency(invoice.amount_due / 100)}</TableCell>
        <TableCell>{formatUnix(invoice.created)}</TableCell>
        <TableCell>
          <Link data-testid="customer-link-cell" href={`/payments?tenantId=${invoice.customer}`}>{invoice.customer_name}</Link>
        </TableCell>
        <TableCell>
          {invoice.description}
        </TableCell>
        <TableCell>
          <InvoiceMenu invoice={invoice} showTenantPaymentsButton={showTenantPaymentsButton} />
        </TableCell>
      </TableRow>
    </>
  )
}