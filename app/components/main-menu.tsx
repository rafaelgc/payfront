import { HelpOutline, HomeOutlined } from "@/node_modules/@mui/icons-material/index";
import { StoreContext } from "@/store";
import { AttachMoney, People } from "@mui/icons-material";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import Link from "next/link";
import { useContext } from "react";

function HelpMenuItem({ setOpen }: { setOpen: (open: boolean) => void}) {
	return (
		<ListItem disablePadding>
			<ListItemButton
				LinkComponent={Link}
				href="/help"
				onClick={() => setOpen(false)}
			>
				<ListItemIcon>
					<HelpOutline />
				</ListItemIcon>
				<ListItemText primary={'Ayuda'} />
			</ListItemButton>
		</ListItem>
	)
}

const drawerWidth = 240;

function DrawerContent({ setOpen }: { setOpen: (open: boolean) => void }) {
	const { state: { token } } = useContext(StoreContext);
  return (
    <>
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
				{token && (
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
						<HelpMenuItem setOpen={setOpen} />
					</List>
				)}
				{!token && (
					<List>
						<ListItem disablePadding>
							<ListItemButton
								LinkComponent={Link}
								href="/"
								onClick={() => setOpen(false)}
							>
								<ListItemIcon>
									<HomeOutlined />
								</ListItemIcon>
								<ListItemText primary={'Inicio'} />
							</ListItemButton>
						</ListItem>
						<HelpMenuItem setOpen={setOpen} />
					</List>
				)}
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