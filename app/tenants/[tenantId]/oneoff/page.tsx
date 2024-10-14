"use client";
import PageContent from "@/components/page-content";
import PageHeader from "@/components/page-header";
import { Alert, AlertTitle, Box, Button, Checkbox, Collapse, FormControl, FormControlLabel, FormHelperText, FormLabel, InputLabel, Link, MenuItem, Radio, RadioGroup, Select, TextField, Typography } from "@mui/material";
import { headers } from "next/headers";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";

interface OneOffPaymentProps {
    params: {
        tenantId: string;
    }
}

export default function OneOffPayment({ params }: OneOffPaymentProps) {
    const router = useRouter();
    const [tenant, setTenant] = useState<any | null>(null);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        loadTenant();
    }, []);

    async function loadTenant() {
        const response = await fetch(`/api/tenants/${params.tenantId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        setTenant(data);
    }
    
    async function saveOneOff() {
        // TODO: add warning if the amount is 0.
        // TODO: add warning or confirmation modal if the amount is too high.
        const response = await fetch('/api/tenants/invoices', {
            method: 'POST',
            body: JSON.stringify({
                customerId: params.tenantId,
                amount,
                description: description
            }),
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        console.log(data);
        router.push(`/payments?tenantId=${params.tenantId}`);
    }

    /*
    function getEntryDateTime() {
        return DateTime.fromISO(entryDate);
    }

    function isFirstPaymentPartial() {
        return getEntryDateDay() !== payDay;
    }

    function getFirstAnchorDateTime(): DateTime {
        let dt = DateTime.fromISO(entryDate);
        if (getEntryDateDay() > payDay) {
            // The pay day corresponds to the next month.
            dt = dt.plus({ months: 1 });
            const effectivePayDay = Math.min(payDay, dt.daysInMonth);
            dt = dt.set({ day: effectivePayDay });
            return dt;
        }
        else if (getEntryDateDay() < payDay) {
            // The pay day corresponds to the current month.
            dt = dt.set({ day: payDay });
            return dt;
        }
        else {
            // Important: set they anchor day to the next month.
            // If the entry date is the same as the anchor (eg: 8 oct), we would charge
            // the tenant 0$ because Stripe would consider that the first cicle is
            // from oct 8 to oct 8 (0 days).
            return dt.plus({ months: 1 });
        }
    }

    function getFirstCicleDuration() {
        return getFirstAnchorDateTime().diff(getEntryDateTime(), 'days').days;
    }

    function getEntryDateDay() {
        const date = new Date(entryDate);
        return date.getDate();
    }
    */

    if (!tenant) {
        return <PageContent>
            <Typography>Cargando...</Typography>
        </PageContent>
    }

    return <>
        <PageHeader title={`Cobro único a ${tenant.name}`} />
        <PageContent>
            <TextField
                label="Descripción"
                fullWidth
                margin="normal"
                placeholder="Cobro de suministros"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
            ></TextField>
            <TextField
                label="Importe"
                fullWidth
                margin="normal"
                type="number"
                onChange={(e) => setAmount(e.target.value)}
                value={amount}
            ></TextField>
            <Box></Box>
            {!tenant.invoice_settings?.default_payment_method &&
                <Alert severity="info">
                    Todavía no tenemos una autorización de pago para este inquilino. Eso quiere decir
                    que este cobro no se podrá realizar automáticamente. El inquilino recibirá un
                    correo electrónico para autorizar el pago y, a partir de esa autorización, los
                    pagos futuros sí se realizarán automáticamente.
                </Alert>
            }
            <Button
                onClick={() => {
                    saveOneOff();
                }}
                variant="contained"
                color="primary"
                sx={{ mt: 2, mr: 2 }}
            >Guardar</Button>
        </PageContent>
    </>
}