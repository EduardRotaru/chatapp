namespace API.Helpers
{
    public static class ExtensionMethods
    {
        public static bool RenameKey<TKey, TValue>(this IDictionary<TKey, TValue> dict,
                                          TKey oldKey, TKey newKey)
        {
            TValue value;
            if (!dict.TryGetValue(oldKey, out value))
                return false;

            dict.Remove(oldKey);
            dict[newKey] = value; 
            return true;
        }
    }
}