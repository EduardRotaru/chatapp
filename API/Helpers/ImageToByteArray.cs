public static class ImageExtentions
{
    public static byte[] ImageToByteArray(this System.Drawing.Image image)
    {
        using (var ms = new MemoryStream())
        {
            image.Save(ms, image.RawFormat);
            return ms.ToArray();
        }
    }
}