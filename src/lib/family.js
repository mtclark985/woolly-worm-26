const STORAGE_KEY = 'woolly_worm_family'

export function getFamily() {
  return localStorage.getItem(STORAGE_KEY)
}

export function setFamily(name) {
  localStorage.setItem(STORAGE_KEY, name)
}

export function clearFamily() {
  localStorage.removeItem(STORAGE_KEY)
}
