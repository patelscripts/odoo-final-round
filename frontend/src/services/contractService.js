import resource from "./resourceService";

const x = resource("/contracts");
export const getContracts = x.list;
export const getContract = x.get;
export const createContract = x.create;
export const updateContract = x.update;
export const deleteContract = x.remove;
