import WEB_APP_CONTROLLER from '../controllers/web-app-controller';
import { VlAlertModel } from '@domg-wc/components/block/alert/vl-alert.model';

export class HttpHelper {
  static async getAsyncTemp<T>(url: string): Promise<T> {
    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };
    const response: Response = await this.fetch(url, options);

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(await response.text());
    }
  }

  static async getAsync(url: string, abort?: AbortSignal): Promise<Response> {
    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      abort: abort,
    };
    return await this.fetch(url, options);
  }

  static async postAsyncTemp(url: string, formDataJsonString: string): Promise<Response> {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: formDataJsonString,
    };

    return await this.fetch(url, options);
  }

  static async postAsync(url: string, formDataJsonString?: string, abort?: AbortSignal): Promise<Response> {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: formDataJsonString,
      abort: abort,
    };
    return await this.fetch(url, options);
  }

  static async postMultipartAsync(url: string, formData: FormData, abort?: AbortSignal): Promise<Response> {
    const options = {
      method: 'POST',
      body: formData,
      abort: abort,
    };
    return await this.fetch(url, options);
  }

  static async putAsync(url: string, formDataJsonString: string, abort?: AbortSignal): Promise<Response> {
    const options = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: formDataJsonString,
      abort: abort,
    };
    return await this.fetch(url, options);
  }

  static async patchAsyncTemp(url: string, formDataJsonString: string): Promise<Response> {
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: formDataJsonString,
    };
    return await this.fetch(url, options);
  }

  static async patchAsync(url: string, formDataJsonString: string, abort?: AbortSignal): Promise<Response> {
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: formDataJsonString,
      abort: abort,
    };
    return await this.fetch(url, options);
  }

  static async deleteAsyncTemp(url: string): Promise<void> {
    const options = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    };
    const response: Response = await this.fetch(url, options);

    if (!response.ok) {
      throw new Error(await response.text());
    }
  }

  static async deleteAsync(url: string, abort?: AbortSignal): Promise<Response> {
    const options = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      abort: abort,
    };
    return await this.fetch(url, options);
  }

  static async showApiError(error: Response) {
    const errorObject = error.clone();
    const errorAsText = await error.clone().text();

    if (errorObject.status === 401) {
      window.location.href = '/';
      return;
    }

    const alertModel: VlAlertModel = {
      type: 'error',
      title: `${errorObject.status} - ${errorObject.statusText}`,
    };

    if (this.isJsonString(errorAsText)) {
      const apiError = await error.clone().json();

      if (apiError?.message?.includes('duplicate key')) {
        alertModel.message =
          'Er is een fout opgetreden. De gegevens die u probeert toe te voegen bestaan al in het dossier. Controleer de invoer en probeer het opnieuw.';
      } else {
        alertModel.message = apiError?.message;
      }
    } else {
      alertModel.message = errorAsText;
    }

    dispatchEvent(
      new CustomEvent('gezond-alert-fired', {
        detail: { alert: alertModel },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static isJsonString(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  static async fetch(url: string, options: object) {
    return await fetch(url, options)
      .then((res: Response) => {
        if (res.ok) {
          return res;
        }
        if (res.status === 401) {
          this.promptAuthentication();
          return res;
        }
        throw res;
      })
      .catch((res) => {
        this.showApiError(res);
        return res;
      })
      .finally(() => {
        WEB_APP_CONTROLLER.loading = false;
      });
  }

  static promptAuthentication() {
    window.location.assign('/rest/protected-resource?return-url=' + window.encodeURIComponent(window.location.href));
  }
}
