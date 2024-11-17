import axios from "axios";
import { ACTIONS, StoreContext } from "@/store";
import { Box, Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [processingRequest, setProcessingRequest] = useState<boolean>(false);
  const router = useRouter();
  const { state: { token }, dispatch } = useContext(StoreContext);

  return (
    <form>
      <TextField
          label="Correo electrónico"
          fullWidth
          type="email"
          margin="normal"
          value={email}
          data-testid="email"
          onChange={(e) => setEmail(e.target.value)}
      ></TextField>
      <TextField
          label="Contraseña"
          fullWidth
          margin="normal"
          type="password"
          value={password}
          data-testid="password"
          onChange={(e) => setPassword(e.target.value)}
      ></TextField>
      <Box>
        <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            data-testid="submit"
            disabled={processingRequest}
            onClick={async () => {
              try {
                setProcessingRequest(true);
                const response = await axios.post('/api/auth', {
                  email,
                  password,
                });

                const data = response.data;

                localStorage.setItem('token', data.token);
                dispatch({ type: ACTIONS.SET_TOKEN, payload: data.token });
                router.push('/');
              }
              catch (e) {
                alert('Error al iniciar sesión');
              }
              finally {
                setProcessingRequest(false);
              }
            }}
        >Iniciar sesión</Button>
      </Box>
    </form>
  )
}