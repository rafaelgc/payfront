import { Box, Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyType, setCompanyType] = useState("individual");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();

  return (
    <form>
      <TextField
          label="Correo electrónico"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
      ></TextField>
      <TextField
          label="Contraseña"
          fullWidth
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
      <FormControlLabel
          control={<Checkbox />}
          label="Acepto los términos y condiciones"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted((e.target as HTMLInputElement).checked)}
      />
      <Box>
        <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={async () => {
              const response = await fetch('/api/users', {
                method: 'POST',
                body: JSON.stringify({
                  email,
                  password,
                  companyType,
                })
              });

              const redirectInfo = await response.json();

              localStorage.setItem('token', redirectInfo.token);

              router.push(redirectInfo.url);
            }}
        >Comenzar</Button>
      </Box>
    </form>
  )
}