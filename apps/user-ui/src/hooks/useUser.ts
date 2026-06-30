import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";



const fetchUser = async () => {
  try {
	const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/logged-in-user`);
	return response.data.user;
	  } catch (error) {
		console.error("Error fetching user:", error);
		throw error;
	  }
};

const useUser = () => {
  const {data: user, isLoading, isError, refetch} = useQuery({
	queryKey: ["user"],
	queryFn: fetchUser,
	staleTime: 5 * 60 * 1000, // 5 minutes
	// refetchOnWindowFocus: false,
	// refetchOnReconnect: false,
	retry: 1, // Retry once on failure
  });
  return { user, isLoading, isError, refetch };
};

export default useUser;