import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const mimeType =
  (control: AbstractControl): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {

    if (!control.value || typeof(control.value) === 'string') {
      return of(null);
    }

    const file = control.value as File;
    const fileReader = new FileReader();

    // Create observable to return
    const fileReader$ = Observable.create((observer: Observer<{ [key: string]: any }>) => {
      fileReader.addEventListener('loadend', () => {

        const unsignedEightBitIntArray = new Uint8Array(fileReader.result).subarray(0, 4);
        let header = '';
        let isValid = false;

        for (let i = 0; i < unsignedEightBitIntArray.length; i++) {
          header += unsignedEightBitIntArray[i].toString(16);
        }

        // This are the image related mime-types.
        switch (header) {
          case '89504e47': // png
          case '47494638': // gif
          case 'ffd8ffe0': // jpg
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
            isValid = true;
            break;
          default:
            isValid = false;
            break;
        }

        if (isValid) {
          observer.next(null);
        } else {
          observer.next({ invalidMimeType: true });
        }

        observer.complete();

      });
      fileReader.readAsArrayBuffer(file);
    });
    return fileReader$;
  };
