import { useState, useEffect } from "react";
import { isPlatform } from "@ionic/react";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

// Create a React hook to take and manage photos from the device
// Use the Capacitor getPhoto method, which already contains platform-specific code

export function usePhotoGallery() {
  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    })
  }
  return {
    takePhoto
  }
}