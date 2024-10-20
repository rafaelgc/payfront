"use client";
import { useState } from "react";
import CustomAppBar from "./app-bar";
import MainMenu from "./main-menu";

export default function Navigation() {
  const [open, setOpen] = useState(false);
	return (
		<>
			<CustomAppBar open={open} setOpen={setOpen} />
			<MainMenu open={open} setOpen={setOpen} />
		</>
	)
}