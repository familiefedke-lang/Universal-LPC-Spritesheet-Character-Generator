// Advanced Tools component - Custom file upload with z-position
import { state } from "../../state/state.js";
import { CollapsibleSection } from "../CollapsibleSection.js";

let nextPartId = 1;

// Pending values for the "add part upload" form
const pendingPart = {
  label: "",
  zPos: 100,
  file: null,
};

export const AdvancedTools = {
  view: function () {
    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Load the image file
      const img = new Image();
      img.onload = function () {
        state.customUploadedImage = img;
        m.redraw();
      };
      img.src = URL.createObjectURL(file);
    };

    const handleZPosChange = (e) => {
      const value = parseInt(e.target.value);
      state.customImageZPos = isNaN(value) ? 0 : value;
      m.redraw();
    };

    const clearCustomImage = () => {
      state.customUploadedImage = null;
      state.customImageZPos = 0;
      // Clear the file input
      const fileInput = document.getElementById("customFileInput");
      if (fileInput) fileInput.value = "";
      m.redraw();
    };

    // Part upload handlers
    const handlePartFile = (e) => {
      pendingPart.file = e.target.files[0] || null;
    };

    const handlePartLabel = (e) => {
      pendingPart.label = e.target.value;
    };

    const handlePartZPos = (e) => {
      const value = parseInt(e.target.value);
      pendingPart.zPos = isNaN(value) ? 100 : value;
    };

    const addPartUpload = () => {
      if (!pendingPart.file) return;

      const img = new Image();
      const objectUrl = URL.createObjectURL(pendingPart.file);
      img.onload = function () {
        URL.revokeObjectURL(objectUrl);
        const id = nextPartId++;
        state.customPartUploads = [
          ...state.customPartUploads,
          {
            id,
            label: pendingPart.label || "Unnamed Part",
            image: img,
            zPos: pendingPart.zPos,
          },
        ];

        // Reset pending form
        pendingPart.label = "";
        pendingPart.zPos = 100;
        pendingPart.file = null;
        const partFileInput = document.getElementById("partFileInput");
        if (partFileInput) partFileInput.value = "";

        m.redraw();
      };
      img.src = objectUrl;
    };

    const removePartUpload = (id) => {
      state.customPartUploads = state.customPartUploads.filter(
        (p) => p.id !== id,
      );
      m.redraw();
    };

    const updatePartZPos = (id, e) => {
      const value = parseInt(e.target.value);
      const zPos = isNaN(value) ? 100 : value;
      state.customPartUploads = state.customPartUploads.map((p) =>
        p.id === id ? { ...p, zPos } : p,
      );
      m.redraw();
    };

    const zPosHelp = m("p.help", [
      "Layer order: ",
      m("code", "0=shadow"),
      ", ",
      m("code", "10=body"),
      ", ",
      m("code", "70=arms"),
      ", ",
      m("code", "110=beard"),
    ]);

    return m(
      CollapsibleSection,
      {
        title: "Advanced Tools",
        storageKey: "advanced",
        defaultOpen: false,
      },
      [
        // ── Existing single custom overlay ──────────────────────────────────
        m("div.field", [
          m("label.label", "Custom File Upload"),
          m("div.control", [
            m("input.input[type=file]#customFileInput", {
              accept: "image/*",
              onchange: handleFileUpload,
            }),
          ]),
          m(
            "p.help",
            "Upload a local image file to overlay on the spritesheet",
          ),
        ]),
        m("div.field", [
          m("label.label", "Z-Position"),
          m("div.control", [
            m("input.input[type=number]", {
              value: state.customImageZPos,
              oninput: handleZPosChange,
              placeholder: "0",
            }),
          ]),
          zPosHelp,
        ]),
        state.customUploadedImage &&
          m("div.field", [
            m("div.control", [
              m(
                "button.button.is-small.is-warning",
                {
                  onclick: clearCustomImage,
                },
                "Clear Custom Image",
              ),
            ]),
          ]),

        m("hr"),

        // ── Custom Part Uploads ─────────────────────────────────────────────
        m("h4.title.is-6.mb-2", "Custom Part Uploads"),
        m(
          "p.help.mb-3",
          "Upload named spritesheet images for specific parts (body, face, etc.). Each image is composited at the chosen layer depth.",
        ),

        // List of existing uploads
        state.customPartUploads.length > 0 &&
          m(
            "div.mb-3",
            state.customPartUploads.map((part) =>
              m(
                "div.is-flex.is-align-items-center.mb-2",
                {
                  key: part.id,
                  style: "gap: 0.5rem;",
                },
                [
                  m(
                    "span.tag.is-info.is-light",
                    { style: "flex-shrink: 0;" },
                    part.label,
                  ),
                  m("input.input.is-small[type=number]", {
                    value: part.zPos,
                    title: "Z-Position",
                    style: "width: 5rem; flex-shrink: 0;",
                    oninput: (e) => updatePartZPos(part.id, e),
                  }),
                  m(
                    "button.button.is-small.is-danger.is-light",
                    {
                      onclick: () => removePartUpload(part.id),
                      title: "Remove",
                    },
                    "✕",
                  ),
                ],
              ),
            ),
          ),

        // Add-new-part form
        m("div.box.has-background-white-bis.p-3", [
          m("p.is-size-7.has-text-weight-semibold.mb-2", "Add Part Upload"),
          m("div.field", [
            m("label.label.is-small", "Label"),
            m("div.control", [
              m("input.input.is-small[type=text]", {
                value: pendingPart.label,
                oninput: handlePartLabel,
                placeholder: "e.g. Custom Body, Custom Face",
              }),
            ]),
          ]),
          m("div.field", [
            m("label.label.is-small", "Image File"),
            m("div.control", [
              m("input.input.is-small[type=file]#partFileInput", {
                accept: "image/*",
                onchange: handlePartFile,
              }),
            ]),
          ]),
          m("div.field", [
            m("label.label.is-small", "Z-Position"),
            m("div.control", [
              m("input.input.is-small[type=number]", {
                value: pendingPart.zPos,
                oninput: handlePartZPos,
                placeholder: "100",
              }),
            ]),
            zPosHelp,
          ]),
          m("div.field", [
            m("div.control", [
              m(
                "button.button.is-small.is-primary",
                {
                  onclick: addPartUpload,
                  disabled: !pendingPart.file,
                },
                "Add Part Upload",
              ),
            ]),
          ]),
        ]),
      ],
    );
  },
};
