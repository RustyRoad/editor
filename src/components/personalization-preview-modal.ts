import { createModalContainer, showModal, attachCloseHandlers } from './modal-core'

export class PersonalizationPreviewModal {
  private modal: HTMLDialogElement | null = null
  private editor: any

  constructor(editor: any, opts = {}) {
    this.editor = editor
    this.init()
  }

  private init() {
    this.modal = createModalContainer()
    this.modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto mt-20">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Preview with Campaign Context</h3>
          <button id="modal-close-button" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Campaign Slug</label>
            <input type="text" id="preview-campaign" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., door-hanger">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Parcel Type</label>
            <select id="preview-parcel" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">Default</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">A/B Variant</label>
            <select id="preview-variant" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          <button id="preview-btn" class="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Preview Page
          </button>
        </div>
      </div>
    `

    this.initEvents()
    attachCloseHandlers(this.modal)
  }

  private initEvents() {
    if (!this.modal) return

    const previewBtn = this.modal.querySelector('#preview-btn') as HTMLButtonElement
    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        const campaignInput = this.modal!.querySelector('#preview-campaign') as HTMLInputElement
        const parcelSelect = this.modal!.querySelector('#preview-parcel') as HTMLSelectElement
        const variantSelect = this.modal!.querySelector('#preview-variant') as HTMLSelectElement

        const campaign = campaignInput?.value || ''
        const parcel = parcelSelect?.value || ''
        const variant = variantSelect?.value || ''

        // Build preview URL with query params
        const currentUrl = window.location.href.split('?')[0]
        const params = new URLSearchParams()
        if (campaign) params.set('campaign', campaign)
        if (parcel) params.set('parcel', parcel)
        if (variant) params.set('ab', variant)

        const previewUrl = `${currentUrl}?${params.toString()}`
        window.open(previewUrl, '_blank')
      })
    }
  }

  show() {
    if (this.modal) {
      showModal(this.modal)
    }
  }

  hide() {
    if (this.modal && this.modal.parentNode) {
      this.modal.remove()
      this.modal = null
    }
  }
}