"use client";
import PageContent from "@/components/page-content";
import PageHeader from "@/components/page-header";
import { Alert, AlertTitle, Box, Button, Checkbox, Collapse, FormControl, FormControlLabel, FormHelperText, FormLabel, InputLabel, Link, MenuItem, Radio, RadioGroup, Select, TextField, Typography } from "@mui/material";
import { headers } from "next/headers";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getMinimumChargeAmount } from "@/invoice-utils";

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
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [processingRequest, setProcessingRequest] = useState<boolean>(false);

    useEffect(() => {
        loadTenant();
    }, []);

    const isValid = () => {
        return amount !== "" && parseFloat(amount) > getMinimumChargeAmount();
    }

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
        if (parseFloat(amount) > 500) {
            if (!confirm("El importe parece muy alto. ¿Estás seguro de que quieres cobrar esta cantidad?")) {
                return;
            }
        }

        try {
            setErrorMessage('');
            setProcessingRequest(true);
            const response = await axios.post('/api/tenants/invoices', {
                    customerId: params.tenantId,
                    amount,
                    description: description
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = response.data;
            console.log(data);
            router.push(`/payments?tenantId=${params.tenantId}&invoiceCreated=true`);
        }
        catch (e) {
            setErrorMessage((e as any).response.data.message);
            setProcessingRequest(false);
        }
    }

    if (!tenant) {
        return <PageContent>
            <Typography>Cargando...</Typography>
        </PageContent>
    }

    return <>
        <PageHeader title={`Cobro único a ${tenant.name}`} />
        <PageContent>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
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
                placeholder={`Mínimo ${getMinimumChargeAmount()} €`}
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
                disabled={!isValid() || processingRequest}
            >Cobrar</Button>
        </PageContent>
    </>
}