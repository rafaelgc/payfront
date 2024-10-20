import { Menu } from "@mui/icons-material";
import { AppBar, Typography } from "@mui/material";
import { IconButton, Toolbar } from "@mui/material";

interface AppBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function CustomAppBar({ open, setOpen }: AppBarProps) {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 10000,
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      }}
      elevation={0}
      // bgcolor white:
      color="inherit"
    >
      <Toolbar disableGutters>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={() => setOpen(!open)}
          edge="start"
          // Hide in desktop (greater than md)
          sx={[
            {
              mr: 2,
            },
            { display: { xs: 'block', sm: 'block', md: 'none' } },
          ]}
        >
          <Menu />
        </IconButton>
        <Typography
          variant="h3"
          noWrap
          component="div"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.1em'
          }}
        >
          payfront.habitacional.ess
        </Typography>
      </Toolbar>
    </AppBar>
  )
}