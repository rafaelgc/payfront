"use client";
import { ACTIONS, StoreContext } from "@/store";
import { useContext, useEffect } from "react";

interface AuthenticationProps {
    children?: any;
}
export const Authentication = ({ children }: AuthenticationProps) => {
	const { dispatch } = useContext(StoreContext);

	useEffect(() => {
		console.log('use effect');
		const token = localStorage.getItem('token');
		if (token) {
			console.log('dispatching...');
			dispatch({ type: ACTIONS.SET_TOKEN, payload: token });
		}
	}, [dispatch]);

	return <>{children}</>
}