import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
};

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private cloudName = 'dkgrpzzkb';
  private uploadPreset = 'team-up_avatars';

  constructor(private http: HttpClient) {}

  uploadAvatar(file: File): Observable<CloudinaryUploadResponse> {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', this.uploadPreset);
    form.append('folder', 'avatars');

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    return this.http.post<CloudinaryUploadResponse>(url, form);
  }
}
