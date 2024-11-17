"use client";
import PageContent from "@/app/components/page-content";
import PageHeader from "@/app/components/page-header";
import { Alert, Box, Button, IconButton, List, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, useMediaQuery, useTheme } from "@mui/material";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Tristate } from "@/app/components/tristate/tristate";
import { NoResults } from "../components/no-results";
import { Undo } from "@mui/icons-material";
import { InvoiceItem } from "@/app/payments/invoice-item/invoice-item";
import { InvoiceRow } from "@/app/payments/invoice-row/invoice-row";
import axios from "axios";

// [IMPROVEMENT]: enviar notificacion cuando recibimos notificacion de refund.

export function Payments() {
  const [invoices, setInvoices] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const params = useSearchParams();

  const loadInvoices = async (startingAfter?: string, withReset?: boolean) => {
    setLoading(true);
    const query = new URLSearchParams({
      tenantId: params.get('tenantId') ?? '',
      startingAfter: startingAfter ?? '',
    }).toString();

    const response = await axios.get(`/api/tenants/invoices?${query}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });

    const data = response.data;
    if (withReset) {
      setInvoices(data.data);
    }
    else {
      const newInvoices = [
        ...(invoices ?? []),
        ...data.data
      ];
      setInvoices(newInvoices);
    }
    setLoading(false);
    setHasMore(data.has_more);
  };

  useEffect(() => {
    setInvoices(null); // Loading.
    // It is necessary to reset the invoices. Otherwise, even if we
    // setInvoices(null), the loadInvoices will see the previous invoices (I think
    // the invoices present when the function was called).
    loadInvoices(undefined, true);
  }, [params]);

  const getTitle = () => {
    if (params.get('tenantId') && invoices) {
      return `Pagos de ${invoices[0].customer_name}`;
    }
    return 'Pagos';
  }

  const isFilteringByTenant = !!params.get('tenantId');

  const theme = useTheme();
  const dense = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <PageHeader title={getTitle()}>
        {isFilteringByTenant &&
          <IconButton LinkComponent={Link} href={'/payments'}>
            <Undo />
          </IconButton>
        }
      </PageHeader>

      <PageContent>
        {params.get('invoiceCreated') && (
          <Alert severity="success" sx={{ mt: 2 }}>
            El cobro se ha iniciado correctamente.
          </Alert>
        )
        }
        <Tristate observed={invoices}>
          {/** When loading... */} 
          <Skeleton variant="rectangular" width="100%" height={200} />
          {/** When there are no invoices... */}
          <NoResults>
            No hay ningún pago registrado todavía.
          </NoResults>
          {/** When there are invoices... */}
          <>
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
                    <InvoiceRow key={invoice.id} invoice={invoice} showTenantPaymentsButton={!isFilteringByTenant} />
                  ))}
                </TableBody>
              </Table>
            ) : (
              <List>
                {invoices?.map((invoice) => (
                  <InvoiceItem key={invoice.id} invoice={invoice} showTenantPaymentsButton={!isFilteringByTenant} />
                ))}
              </List>
            )}
            {invoices && hasMore &&
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  data-testid="load-more-button"
                  disabled={loading}
                  variant="text"
                  onClick={() => {
                    loadInvoices(invoices[invoices.length - 1].id);
                  }}
                >Cargar más</Button>
              </Box>
            }
          </>
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