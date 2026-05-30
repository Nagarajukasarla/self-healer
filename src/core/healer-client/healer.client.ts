import axios from "axios";

import { env } from "../../config/env";

import { HealingRequest, HealingResponse } from "../../types/healer";

export class HealerClient {
  async heal(payload: HealingRequest): Promise<HealingResponse> {
    const response = await axios.post(
      `${env.HEALER_AI_SERVICE_URL}/heal`,
      payload,
    );

    return response.data;
  }
}
