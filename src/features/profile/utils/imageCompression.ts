import * as ImageManipulator from "expo-image-manipulator";

export const compressImageAsync = async (
  uri: string,
  compress = 0.7,
): Promise<string> => {
  const result = await ImageManipulator.manipulateAsync(uri, [], {
    compress,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return result.uri;
};
