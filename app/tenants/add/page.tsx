"use client";
import PageContent from "@/components/page-content";
import PageHeader from "@/components/page-header";
import { Alert, AlertTitle, Box, Button, Checkbox, Collapse, FormControl, FormControlLabel, FormHelperText, FormLabel, InputLabel, Link, MenuItem, Radio, RadioGroup, Select, TextField, Typography } from "@mui/material";
import { headers } from "next/headers";
import { useState } from "react";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { getMinimumChargeAmount } from "@/invoice-utils";

export default function AddTenant() {
    const router = useRouter();
    const [whatsNext, setWhatsNext] = useState(false);
    // State for the form:
    const [tenantName, setTenantName] = useState("");
    const [tenantEmail, setTenantEmail] = useState("");
    const [rent, setRent] = useState("");
    const [entryDate, setEntryDate] = useState("");
    const [payDay, setPayDay] = useState<number>(1);
    const [isSaving, setIsSaving] = useState(false);

    async function saveTenant() {
        setIsSaving(true);
        // [TODO]: catch 4XX error. Use axios instead.
        try {
            await fetch('/api/tenants', {
                method: 'POST',
                body: JSON.stringify({
                    email: tenantEmail,
                    name: tenantName,
                    rent: rent,
                    anchorDate: getFirstAnchorDateTime().toISODate(),
                    entryDate: entryDate,
                }),
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            router.push('/?newTenant=true');
        }
        catch (e) {
            console.error(e);
            alert('Ha ocurrido un error al guardar el inquilino. Escríbenos a contact@habitacional.es para que podamos ayudarte.');
        }
        finally {
            setIsSaving(false);
        }
    }

    function getEntryDateTime() {
        return DateTime.fromISO(entryDate);
    }

    function isFirstPaymentPartial(): boolean {
        return entryDate.length > 0 && getEntryDateDay() !== payDay;
    }

    function getFirstAnchorDateTime(): DateTime {
        let dt = DateTime.fromISO(entryDate);
        if (!dt.isValid) {
            return dt; // throw an error instead?
        }
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

    function canCalculateFirstCicleRent() {
        return getEntryDateTime().isValid && !!rent && !!payDay;
    }

    function calculateFirstCicleRent() {
        if (!getEntryDateTime().isValid) {
            return 0;
        }
        const days = getFirstCicleDuration();
        const parsedRent = parseFloat(rent);
        const entryDt: DateTime = getEntryDateTime();
        if (!entryDt.daysInMonth) {
            return 0;
        }
        return parsedRent * days / entryDt.daysInMonth;
    }

    function firstCircleRentValid() {
        return calculateFirstCicleRent() > getMinimumChargeAmount()
    }

    function getEntryDateDay() {
        const date = new Date(entryDate);
        return date.getDate();
    }

    function validated() {
        return tenantName && tenantEmail && rent && entryDate && payDay && firstCircleRentValid();
    }

    function formatCurrency(amount: number) {
        const formatter = new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
        });
        return formatter.format(amount);
    }

    return <>
        <PageHeader title="Nuevo inquilino" />
        <PageContent>
            <TextField
                label="Nombre completo de tu inquilino"
                fullWidth
                margin="normal"
                onChange={(e) => setTenantName(e.target.value)}
                value={tenantName}
            ></TextField>
            <TextField
                label="Correo electrónico de tu inquilino"
                fullWidth
                margin="normal"
                onChange={(e) => setTenantEmail(e.target.value)}
                value={tenantEmail}
            ></TextField>
            <TextField
                label="Renta mensual"
                fullWidth
                margin="normal"
                type="number"
                onChange={(e) => setRent(e.target.value)}
                value={rent}
            ></TextField>
            <FormControl
                fullWidth
                margin="normal"
            >
                <InputLabel id="demo-simple-select-label">¿Qué día del mes quieres cobrar la renta?</InputLabel>
                <Select
                    label="¿Qué día del mes quieres cobrar la renta?"
                    value={payDay}
                    onChange={(e) => { setPayDay(parseInt(e.target.value.toString())); }}
                >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <MenuItem key={day} value={day}>{day}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                label="Fecha de entrada del inquilino"
                fullWidth
                margin="normal"
                type="date"
                onChange={(e) =>{ setEntryDate(e.target.value) }}
                value={entryDate}
                InputLabelProps={{ shrink: true }}
            ></TextField>

            <Collapse in={isFirstPaymentPartial()}>
                <Alert severity="info" sx={{ my: 1 }}>
                    La primera renta que recibirás será parcial, desde el día {getEntryDateTime().toFormat('dd/MM/yyyy')}&nbsp;
                    hasta el día {getFirstAnchorDateTime().toFormat('dd/MM/yyyy')} ({getFirstCicleDuration()} días).
                </Alert>
            </Collapse>
            <Collapse in={!firstCircleRentValid() && canCalculateFirstCicleRent()}>
                <Alert severity="error" sx={{ my: 1 }}>
                    El primer ciclo de facturación es muy corto y la renta es muy baja ({formatCurrency(calculateFirstCicleRent())}).
                    El mínimo es de {formatCurrency(getMinimumChargeAmount())}.
                </Alert>
            </Collapse>

            {/*}
            <Collapse in={!isEntryDateFirstOfMonth() && entryDate}>
                <FormControl variant="standard">
                    <FormLabel id="demo-error-radios">
                        ¿Siempre quieres cobrar la renta el día {getEntryDateDay()} de cada mes?
                    </FormLabel>
                    <RadioGroup
                        value={firstMonthRentPaid}
                        onChange={(e) => { setFirstMonthRentPaid('true' === e.target.value); }}
                    >
                        <FormControlLabel value={false} control={<Radio />} label="Sí, siempre." />
                        <FormControlLabel value={true} control={<Radio />} label="No, a partir del próximo mes, la cobraré el día 1." />
                    </RadioGroup>
                </FormControl>
                <Collapse in={firstMonthRentPaid}>
                    <Alert severity="info" sx={{ my: 1 }}>
                        Como el primer mes es parcial y el día de cobro será distinto al del resto de meses, necesitamos
                        que este primer mes lo cobres tú mismo. A partir del próximo mes, la renta se cobrará automáticamente
                        a través de la domiciliación bancaria que vamos a configurar.
                    </Alert>
                    <FormControlLabel control={<Checkbox />} label="Estoy de acuerdo, este primer mes lo cobraré por mis propios medios." />
                </Collapse>
            </Collapse>
            */}
            <Box></Box>
            <Button
                onClick={() => {
                    saveTenant();
                }}
                variant="contained"
                color="primary"
                sx={{ mt: 2, mr: 2 }}
                disabled={!validated() || isSaving}
            >Guardar</Button>
            <Link href="#" onClick={() => {
                setWhatsNext(!whatsNext);
            }}>¿Qué va a ocurrir ahora?</Link>
            <Collapse in={whatsNext}>
                <WhatsNext firstPaymentPartial={isFirstPaymentPartial()} payDay={payDay} entryDate={getEntryDateTime()} />
            </Collapse>
        </PageContent>
    </>
}

interface WhatsNextProps {
    payDay: number;
    entryDate: DateTime;
    firstPaymentPartial: boolean;
}

function WhatsNext({
    payDay,
    entryDate,
    firstPaymentPartial,
}: WhatsNextProps) {
    console
    if (!entryDate || !entryDate.isValid || !payDay) {
        return <>Por favor, rellena el formulario de arriba y después te explicaremos qué es lo que sucederá.</>
    }
    return <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>¿Qué va a ocurrir ahora?</AlertTitle>
        <Typography sx={{ mb: '16px' }}>
            Vamos a configurar la domiciliación bancaria para que la renta se cobre automáticamente el día {payDay} de cada mes.
        </Typography>
        {firstPaymentPartial &&
            <Typography sx={{ mb: '16px' }}>
                La primera renta, que será parcial, se cobrará el día {entryDate.toFormat('dd/MM/yyyy')}. A partir de entonces, se cobrará el día {payDay} de cada mes.
            </Typography>
        }
        
        <Typography sx={{ mb: '16px' }}>
            Tu inquilino recibirá un correo electrónico el día {entryDate.toFormat('dd/MM/yyyy')} para autorizar
            la domiciliación bancaria. Es muy importante que la acepte, de lo contrario, no podremos cobrarle la renta.
            Desde el apartado de Pagos podrás ver si ha autorizado el cobro.
        </Typography>
        <Typography sx={{ mb: '16px' }}>
            A partir de esa primera autorización, la renta se cobrará automáticamente sin que el inquilino o tú tengáis
            que intervenir. Además, una vez autorice los cargos, también podrás hacerle cobros de importes arbitrarios, por ejemplo,
            para el cobro de suministros.
        </Typography>
        <Typography sx={{ mb: '16px' }}>
            Ten en cuenta que las cobros por domiciliación pueden tardar varios días en llegar a tu cuenta bancaria.
        </Typography>
    </Alert>
}