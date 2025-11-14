import { APIError } from "payload";

class CustomAPIError extends APIError {
  constructor(message: string) {
    super(message, 400, undefined, true);
  }
}

export default CustomAPIError;
