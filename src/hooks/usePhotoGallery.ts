import { useState, useEffect } from "react";
import { isPlatform } from "@ionic/react";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

// Create a React hook to take and manage photos from the device

const PHOTO_STORAGE = 'photos'

export function usePhotoGallery() {
  // TS useState syntax slightly different from JS
  // Store the array of each photo captured with the camera
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  
  // useEffect only called on render
  useEffect(() => {
    const loadSaved = async () => {
      const { value } = await Preferences.get({ key: PHOTO_STORAGE })
      const photosInPreferences = (value ? JSON.parse(value) : []) as UserPhoto[]
      // For web platform, need to read each image from filesystem in base64 format
      if (!isPlatform('hybrid')) {
        for (let photo of photosInPreferences) {
          const file = await Filesystem.readFile({
            path: photo.filepath,
            directory: Directory.Data,
          })
          photo.webviewPath = `data:image/jpeg;base64,${file.data}`
        }
      }

      setPhotos(photosInPreferences)
    }
    loadSaved()
  }, [])

  // Use the Capacitor getPhoto method, which already contains platform-specific code
  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    })

    // Push photos to state array
    // Name each new photo with timestamp
    const fileName = Date.now() + '.jpeg';
    const savedFileImage = await savePicture(photo, fileName)
    // Update the existing photos array to include the new photo
    const newPhotos = [
      ...photos, savedFileImage
    ]
      setPhotos(newPhotos);

      // Storing the photos array each time a new photo is taken
      Preferences.set({key: PHOTO_STORAGE, value: JSON.stringify(newPhotos)})

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

// Saving images to the filesystem so they remain on application reload - pass in photo object and fileName, then save to Capacitor's Filesystem API using .writeFile
const savePicture = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
  let base64Data: string;
  // "hybrid" detects Cordova or Capacitor - i.e. need to convert to base64
  if (isPlatform('hybrid')) {
    const file = await Filesystem.readFile({
      path: photo.path!,
    });
    // I can't seem to find why this isn't okay!
    base64Data = file.data;
  } else {
    base64Data = await base64FromPath(photo.webPath!);
  }

  const savedFile = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Data,
  })
  if (isPlatform('hybrid')) {
    return {
      filepath: savedFile.uri,
      webviewPath: Capacitor.convertFileSrc(savedFile.uri)
    }
  } else {
  return {
    filepath: fileName,
    webviewPath: photo.webPath,
    }
  }
}

// Helper util - we give it a path, it downloads the file located there, and returns a base64 representation of that file
export async function base64FromPath(path:string): Promise<string> {
  const response = await fetch(path)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject('method did not return a string')
      }
    }
    reader.readAsDataURL(blob)
  })
}