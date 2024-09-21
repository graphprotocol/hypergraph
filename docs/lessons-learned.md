# Lessons Learned

## Tinybase/Yjs Integration

- For Tinybase Yjs Persister you need to first to invoke `save` or `startAutoSave` before the first `load` or `startAutoLoad` call. Otherwise an error will be thrown since the whole Tinybase nested Map structure does not exist yet in the Yjs document.
- Do not modify the Yjs document directly in the same place since this will mess with the persister e.g. `const map = newYDoc.getMap("space"); map.set("id", spaceId);`.
