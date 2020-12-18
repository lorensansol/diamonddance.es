// SimpleLightbox
(function () {
  document.querySelectorAll('.group-lightbox').forEach(group => {
    const groupName = group.querySelector('[data-lightbox]').getAttribute('data-lightbox')
    const gallery = new SimpleLightbox(`[data-lightbox='${groupName}']`)
  })
  const galleryAccesorios = new SimpleLightbox("[data-lightbox='accesorios']")
})()

// Modal
const modals = document.querySelectorAll('.modal[id]')
const btnCloseModalAndHash = document.querySelectorAll('[href^="#"][data-dismiss="modal"]')

modals.forEach(modal => {
  // Actualizate hash when open modal
  modal.addEventListener('shown.bs.modal', event => {
    window.location.hash = modal.getAttribute('id')
  }, false)
  // Remove hash when close modal
  modal.addEventListener('hide.bs.modal', event => {
    if (window.location.hash) {
      window.history.pushState('', document.title, window.location.pathname + window.location.search)
    }
  }, false)
})

// Actualizate hash when close modal by button with hash
btnCloseModalAndHash.forEach(e => {
  e.addEventListener('click', c => {
    setTimeout(() => window.location.hash = c.target.getAttribute('href'), 400)
  })
})

// Open modal when load URL with hash
if (window.location.hash) {
  modals.forEach(modal => {
    const hash = '#' + modal.getAttribute('id')
    if (window.location.hash === hash) {
      const whenLoadNewModalInstance = new BSN.Modal(hash, { backdrop: true }).show()
    }
  })
}
