import { getItem } from "../utils/storage.helper";

let data: any;
const getState = async () => {
  data = await getItem(import.meta.env.VITE_ACCESSTK);
};
getState();

const isAuthenticated = (): boolean => {
  if (data) {
    return true;
  } else return false;
};

export default isAuthenticated;
