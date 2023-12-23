import { useEffect } from 'react';
import toast, { Toaster, ToastOptions } from 'react-hot-toast';

const useCustomToast = () => {
  const showToast = (message: string, options?: ToastOptions) => {
    toast(message, options);
  };
  const defaultToast = (message: string, status:string) => {
    status == 'success' ? toast.success(message) :toast.error(message)
  };

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  return {
    showToast,
    defaultToast,
    ToastContainer: Toaster,
  };
};

export default useCustomToast;
