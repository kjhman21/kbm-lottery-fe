import axios from "axios"

export const parseError = (e:any) => {
  if(axios.isAxiosError(e)) {
    var axiosError = e as MyAxiosError;
    return "" + axiosError.response.data.error;
  }
  try {
    var errorMessage = e as MyErrorMessage;
    return "" + e.message;
  } catch(e) {
  }
  return ""+e;
}

type MyAxiosError = {
  response: {
    data: {
      error: string,
    }
  }
}

type MyErrorMessage = {
  message: string,
}