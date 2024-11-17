import axios from "axios";
import { Box, Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyType, setCompanyType] = useState("individual");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<boolean>(false);
  const router = useRouter();

  return (
    <form>
      <TextField
          label="Correo electrónico"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="email"
      ></TextField>
      <TextField
          label="Contraseña"
          fullWidth
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="password"
      ></TextField>
      <FormControl fullWidth margin="normal">
        <InputLabel>Forma jurídica</InputLabel>
        <Select
          fullWidth
          label="Forma jurídica"
          value={companyType}
          onChange={(e) => setCompanyType(e.target.value)}
        >
          <MenuItem value={'individual'}>Soy particular o autónomo</MenuItem>
          <MenuItem value={'company'}>Soy empresa</MenuItem>
        </Select>
      </FormControl>
      {/*
      <FormControlLabel
          control={<Checkbox />}
          label="Acepto los términos y condiciones"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted((e.target as HTMLInputElement).checked)}
      />
      */}
      <Box>
        <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            data-testid="submit"
            disabled={processingRequest || !termsAccepted}
            onClick={async () => {
              try {
                setProcessingRequest(true);
                const response = await axios.post('/api/users', {
                    email,
                    password,
                    companyType,
                });
  
                const redirectInfo = response.data;
  
                localStorage.setItem('token', redirectInfo.token);
  
                router.push(redirectInfo.url);

                // Do not setProcessingRequest(false) here, as the page will be redirected
                // and we don't want the user to be able to click the button again.
              }
              catch (e) {
                alert('Error al crear la cuenta.');
                setProcessingRequest(false);
              }
            }}
        >Comenzar</Button>
      </Box>
    </form>
  )
}