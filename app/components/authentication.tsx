"use client";
import { ACTIONS, StoreContext } from "@/store";
import { useContext, useEffect } from "react";

interface AuthenticationProps {
    children?: any;
}
export const Authentication = ({ children }: AuthenticationProps) => {
	const { dispatch } = useContext(StoreContext);

	useEffect(() => {
		// @ts-ignore
		window.heapReadyCb=window.heapReadyCb||[],window.heap=window.heap||[],heap.load=function(e,t){window.heap.envId=e,window.heap.clientConfig=t=t||{},window.heap.clientConfig.shouldFetchServerConfig=!1;var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src="https://cdn.us.heap-api.com/config/"+e+"/heap_config.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(a,r);var n=["init","startTracking","stopTracking","track","resetIdentity","identify","getSessionId","getUserId","getIdentity","addUserProperties","addEventProperties","removeEventProperty","clearEventProperties","addAccountProperties","addAdapter","addTransformer","addTransformerFn","onReady","addPageviewProperties","removePageviewProperty","clearPageviewProperties","trackPageview"],i=function(e){return function(){var t=Array.prototype.slice.call(arguments,0);window.heapReadyCb.push({name:e,fn:function(){heap[e]&&heap[e].apply(heap,t)}})}};for(var p=0;p<n.length;p++)heap[n[p]]=i(n[p])};
		
		if (window.location.href.includes("localhost")) {
			// @ts-ignore
			heap.load("40082463");
		}
		else {
			// @ts-ignore
			heap.load("1572363813");
		}
		
		console.log('use effect');
		const token = localStorage.getItem('token');
		if (token) {
			console.log('dispatching...');
			dispatch({ type: ACTIONS.SET_TOKEN, payload: token });

			// @ts-ignore
			if (window.heap) {
				// split the token to get the unique identifier
				const uniqueIdentifier = token.split(':')[0];
				// @ts-ignore
				heap.identify(uniqueIdentifier);
				console.log('heap identified', uniqueIdentifier);
			}

		}
		else {
			dispatch({ type: ACTIONS.SET_NOT_LOADING_TOKEN });
		}
	}, [dispatch]);

	return <>{children}</>
}