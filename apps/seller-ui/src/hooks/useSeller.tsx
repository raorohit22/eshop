import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";


const fetchSeller = async () => {
	try {
		const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/logged-in-seller`);
		return response.data.seller;
	} catch (error) {
		console.error("Error fetching seller:", error);
		throw error;
	}
};

const useSeller = () => {
	const { data: seller, isLoading, isError, refetch } = useQuery({
		queryKey: ["seller"],
		queryFn: fetchSeller,
		staleTime: 5 * 60 * 1000, // 5 minutes
		// refetchOnWindowFocus: false,
		// refetchOnReconnect: false,
		retry: 1, // Retry once on failure
	});
	return { seller, isLoading, isError, refetch };
};

export default useSeller;