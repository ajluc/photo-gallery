import { useState, useEffect } from "react";
import { isPlatform } from "@ionic/react";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

// Create a React hook to take and manage photos from the device
// Use the Capacitor getPhoto method, which already contains platform-specific code

export function usePhotoGallery() {
  // TS useState syntax slightly different from JS
  // Store the array of each photo captured with the camera
  const [photos, setPhotos] = useState<UserPhoto[]>([]);

  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    })

    // Name each new photo with timestamp
    const fileName = Date.now() + '.jpeg';
    // Update the existing photos array to include the new photo
    const newPhotos = [
      {
        filepath: fileName,
        webviewPath: photo.webPath,
      },
      ...photos,
    ]
      setPhotos(newPhotos);
  }
  return {
    takePhoto,
    photos
  }
}

// Interface: "a syntactical contract that an entity should conform to". So, here we are standardizing what we want a UserPhoto to be
export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}