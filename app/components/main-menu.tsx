import { AttachMoney, People } from "@mui/icons-material";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import Link from "next/link";

const drawerWidth = 240;

function DrawerContent({ setOpen }: { setOpen: (open: boolean) => void }) {
  return (
    <>
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              LinkComponent={Link}
              href="/"
							onClick={() => setOpen(false)}
            >
              <ListItemIcon>
                <People />
              </ListItemIcon>
              <ListItemText primary={'Inquilinos'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              LinkComponent={Link}
              href="/payments"
							onClick={() => setOpen(false)}
            >
              <ListItemIcon>
                <AttachMoney />
              </ListItemIcon>
              <ListItemText primary={'Pagos'} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </>
  );
}

interface MainMenuProps {
	open: boolean;
	setOpen: (open: boolean) => void;
}

export default function MainMenu({ open, setOpen }: MainMenuProps) {
	return (
		<>
			{/* For mobile */}
			<Drawer
				open={open}
				variant="temporary"
				onClose={() => setOpen(false)}
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					display: { xs: 'block', sm: 'block', md: 'none' },
					'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
				}}
			>
				<DrawerContent setOpen={setOpen} />
			</Drawer>
			{/* For desktop */}
			<Drawer
				open={true}
				variant="permanent"
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					display: { xs: 'none', sm: 'none', md: 'block' },
					'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
				}}
			>
				<DrawerContent setOpen={setOpen} />
			</Drawer>
		</>
	)
}