import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../supabaseConfig";

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log("Checking Auth State:", data, error); // Debugging
      if (error || !data?.user) {
        router.replace("/auth/login"); // Redirect if not authenticated
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth State Changed:", session); // Debugging
        if (!session?.user) {
          router.replace("/auth/login");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null; // Prevents blank screen while checking auth state

  return user;
};
