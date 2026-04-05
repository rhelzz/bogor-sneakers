"use client";

import {
  type ChangeEvent,
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Download,
  ImagePlus,
  Paintbrush,
  RefreshCw,
  Trash2,
  Type,
  WandSparkles,
} from "lucide-react";
import NextImage from "next/image";

const CANVAS_SIZE = 1000;
const MODEL_COUNT = 8;
const MAX_LAYER_SCAN = 12;
const ASSET_FOLDER = "CASUAL HIGH";

const WATERMARK_X = 1990;
const WATERMARK_Y = 3105;
const WATERMARK_ANGLE = 17.2;

const RANDOM_PALETTE = [
  "#0f172a",
  "#ef4444",
  "#ffffff",
  "#eab308",
  "#10b981",
  "#3b82f6",
];

const WHATSAPP_TEMPLATE =
  "hallo ka aku admin riview design dari bogorsneaker, mau riview orderan sepatu kaka ya, ini hasil nya, jika ada yg mau di revisi silahkan kamimasih beri kesempatan 3 kali ya ka, mohon balas nya di jam kerja ya di jam 8.00 - 17.00. aku tunggu ya, jika dalam 5 menit kaka ga balas, aku proses riview pembeli selanjut nya ya ka, terimakasih sebelum nya :)";

type LayerId = number;

interface LayerOutline {
  active: boolean;
  color: string;
  size: number;
}

interface ElementBase {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

interface TextElement extends ElementBase {
  type: "text";
  text: string;
  color: string;
  strokeColor: string;
  strokeSize: number;
}

interface LogoElement extends ElementBase {
  type: "logo";
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

type CustomElement = TextElement | LogoElement;

interface DragState {
  id: string;
  startClientX: number;
  startClientY: number;
  initX: number;
  initY: number;
}

function buildAssetUrl(model: number, fileName: string): string {
  return `/shoes-svg/${encodeURIComponent(ASSET_FOLDER)}/${model}/${encodeURIComponent(fileName)}`;
}

function sanitizeFileToken(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "-");
  return cleaned.length > 0 ? cleaned : "UNKNOWN";
}

function normalizePhoneForWa(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith("8")) {
    return `62${digits}`;
  }
  return digits;
}

function getTextDims(ctx: CanvasRenderingContext2D, text: string, fontSize: number): { width: number; height: number } {
  ctx.font = `800 ${fontSize}px Montserrat, sans-serif`;
  const metrics = ctx.measureText(text || " ");
  return {
    width: Math.max(metrics.width, fontSize * 0.5),
    height: fontSize,
  };
}

function drawFilledLayer(
  image: HTMLImageElement,
  color: string,
  targetWidth: number,
  targetHeight: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return canvas;
  }

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  ctx.globalCompositeOperation = "source-over";
  return canvas;
}

function drawOutlineLayer(
  image: HTMLImageElement,
  color: string,
  thickness: number,
  targetWidth: number,
  targetHeight: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return canvas;
  }

  const px = Math.max(1, thickness);
  const offsets = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ];

  for (const [ox, oy] of offsets) {
    ctx.drawImage(image, ox * px, oy * px, targetWidth, targetHeight);
  }

  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.globalCompositeOperation = "source-over";
  return canvas;
}

export default function InternalDesignStudio() {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const colorPickerRef = useRef<HTMLInputElement | null>(null);
  const logoUploadRef = useRef<HTMLInputElement | null>(null);

  const imageCacheRef = useRef<Map<string, HTMLImageElement | null>>(new Map());
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const layerImagesRef = useRef<Map<LayerId, HTMLImageElement>>(new Map());

  const dragRef = useRef<DragState | null>(null);
  const pointerMovedRef = useRef(false);
  const drawFrameRef = useRef<number | null>(null);
  const elementCounterRef = useRef(0);
  const toastTimerRef = useRef<number | null>(null);

  const [currentModel, setCurrentModel] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [assetRevision, setAssetRevision] = useState(0);

  const [layerIds, setLayerIds] = useState<LayerId[]>([]);
  const [layerColors, setLayerColors] = useState<Record<LayerId, string>>({});
  const [layerOutlines, setLayerOutlines] = useState<Record<LayerId, LayerOutline>>({});
  const [activeLayerPickId, setActiveLayerPickId] = useState<LayerId | null>(null);

  const [customElements, setCustomElements] = useState<CustomElement[]>([]);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);

  const [viewerWidth, setViewerWidth] = useState(520);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shoeSize, setShoeSize] = useState("");
  const [folderNo, setFolderNo] = useState("");
  const [operatorName, setOperatorName] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const scale = viewerWidth / CANVAS_SIZE;

  const activeElement = useMemo(
    () => customElements.find((item) => item.id === activeElementId) ?? null,
    [customElements, activeElementId],
  );

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2800);
  }, []);

  const loadImage = useCallback(async (src: string): Promise<HTMLImageElement | null> => {
    const cache = imageCacheRef.current;
    if (cache.has(src)) {
      return cache.get(src) ?? null;
    }

    const result = await new Promise<HTMLImageElement | null>((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });

    cache.set(src, result);
    return result;
  }, []);

  const loadFirstAvailableImage = useCallback(
    async (model: number, fileCandidates: string[]): Promise<HTMLImageElement | null> => {
      for (const fileName of fileCandidates) {
        const image = await loadImage(buildAssetUrl(model, fileName));
        if (image) {
          return image;
        }
      }
      return null;
    },
    [loadImage],
  );

  const drawPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      return;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (const id of layerIds) {
      const image = layerImagesRef.current.get(id);
      if (!image) {
        continue;
      }

      const outline = layerOutlines[id];
      if (outline?.active) {
        const outlineLayer = drawOutlineLayer(
          image,
          outline.color,
          outline.size,
          CANVAS_SIZE,
          CANVAS_SIZE,
        );
        ctx.drawImage(outlineLayer, 0, 0);
      }

      const fillLayer = drawFilledLayer(image, layerColors[id] ?? "#ffffff", CANVAS_SIZE, CANVAS_SIZE);
      ctx.drawImage(fillLayer, 0, 0);
    }

    if (baseImageRef.current) {
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(baseImageRef.current, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.globalCompositeOperation = "source-over";
    }
  }, [layerIds, layerOutlines, layerColors]);

  const scheduleDraw = useCallback(() => {
    if (drawFrameRef.current !== null) {
      return;
    }

    drawFrameRef.current = window.requestAnimationFrame(() => {
      drawFrameRef.current = null;
      drawPreview();
    });
  }, [drawPreview]);

  const loadModelAssets = useCallback(
    async (model: number, manualRefresh: boolean) => {
      setIsSyncing(true);
      setWaLink(null);
      setActiveElementId(null);
      setCustomElements([]);

      const baseImage = await loadFirstAvailableImage(model, [`model custom-high ${model}_base.svg`]);
      baseImageRef.current = baseImage;

      const nextLayerMap = new Map<LayerId, HTMLImageElement>();
      const nextLayerIds: LayerId[] = [];
      const nextColors: Record<LayerId, string> = {};
      const nextOutlines: Record<LayerId, LayerOutline> = {};

      for (let idx = 1; idx <= MAX_LAYER_SCAN; idx += 1) {
        const layerImage = await loadFirstAvailableImage(model, [`model custom-high ${model}_aksen${idx}.svg`]);
        if (!layerImage) {
          continue;
        }

        nextLayerMap.set(idx, layerImage);
        nextLayerIds.push(idx);
        nextColors[idx] = "#ffffff";
        nextOutlines[idx] = {
          active: false,
          color: "#000000",
          size: 2,
        };
      }

      layerImagesRef.current = nextLayerMap;
      setLayerIds(nextLayerIds);
      setLayerColors(nextColors);
      setLayerOutlines(nextOutlines);
      setActiveLayerPickId(null);
      setAssetRevision((prev) => prev + 1);
      setIsSyncing(false);

      if (!baseImage) {
        showToast("Base SVG model tidak ditemukan.");
        return;
      }

      if (manualRefresh) {
        showToast("Katalog model berhasil disinkronkan.");
      }
    },
    [loadFirstAvailableImage, showToast],
  );

  const updateElement = useCallback((id: string, updater: (item: CustomElement) => CustomElement) => {
    setCustomElements((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  }, []);

  const createElementId = useCallback(() => {
    elementCounterRef.current += 1;
    return `el_${elementCounterRef.current}`;
  }, []);

  const addTextElement = useCallback(() => {
    const id = createElementId();
    const item: TextElement = {
      id,
      type: "text",
      text: "TEKS BARU",
      color: "#000000",
      strokeColor: "#ffffff",
      strokeSize: 0,
      size: 48,
      rotation: 0,
      x: 200,
      y: 220,
    };

    setCustomElements((prev) => [...prev, item]);
    setActiveElementId(id);
  }, [createElementId]);

  const addLogoElement = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const logo = await loadImage(dataUrl);
      if (!logo) {
        showToast("Logo tidak bisa diproses.");
        event.target.value = "";
        return;
      }

      const id = createElementId();
      const item: LogoElement = {
        id,
        type: "logo",
        src: dataUrl,
        naturalWidth: logo.naturalWidth,
        naturalHeight: logo.naturalHeight,
        size: 180,
        rotation: 0,
        x: 180,
        y: 180,
      };

      setCustomElements((prev) => [...prev, item]);
      setActiveElementId(id);
      event.target.value = "";
    },
    [createElementId, loadImage, showToast],
  );

  const removeActiveElement = useCallback(() => {
    if (!activeElementId) {
      return;
    }

    setCustomElements((prev) => prev.filter((item) => item.id !== activeElementId));
    setActiveElementId(null);
  }, [activeElementId]);

  const removeLogoBackground = useCallback(async () => {
    if (!activeElement || activeElement.type !== "logo") {
      return;
    }

    const image = await loadImage(activeElement.src);
    if (!image) {
      showToast("Logo tidak ditemukan.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return;
    }

    ctx.drawImage(image, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      if (r > 220 && g > 220 && b > 220) {
        imgData.data[i + 3] = 0;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const nextSrc = canvas.toDataURL("image/png");
    const nextImg = await loadImage(nextSrc);

    updateElement(activeElement.id, (item) => {
      if (item.type !== "logo") {
        return item;
      }
      return {
        ...item,
        src: nextSrc,
        naturalWidth: nextImg?.naturalWidth ?? item.naturalWidth,
        naturalHeight: nextImg?.naturalHeight ?? item.naturalHeight,
      };
    });

    showToast("Background putih pada logo dihapus.");
  }, [activeElement, loadImage, showToast, updateElement]);

  const addLogoOutline = useCallback(async () => {
    if (!activeElement || activeElement.type !== "logo") {
      return;
    }

    const image = await loadImage(activeElement.src);
    if (!image) {
      showToast("Logo tidak ditemukan.");
      return;
    }

    const thickness = 4;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth + thickness * 2;
    canvas.height = image.naturalHeight + thickness * 2;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const offsets = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];

    for (const [ox, oy] of offsets) {
      ctx.drawImage(
        image,
        thickness + ox * thickness,
        thickness + oy * thickness,
        image.naturalWidth,
        image.naturalHeight,
      );
    }

    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(image, thickness, thickness, image.naturalWidth, image.naturalHeight);

    const nextSrc = canvas.toDataURL("image/png");
    const nextImg = await loadImage(nextSrc);

    updateElement(activeElement.id, (item) => {
      if (item.type !== "logo") {
        return item;
      }
      return {
        ...item,
        src: nextSrc,
        naturalWidth: nextImg?.naturalWidth ?? item.naturalWidth,
        naturalHeight: nextImg?.naturalHeight ?? item.naturalHeight,
      };
    });

    showToast("Outline putih berhasil ditambahkan.");
  }, [activeElement, loadImage, showToast, updateElement]);

  const syncLogoColorsToLayers = useCallback(async () => {
    if (!activeElement || activeElement.type !== "logo") {
      return;
    }

    const image = await loadImage(activeElement.src);
    if (!image) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return;
    }

    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorBucket: Record<string, number> = {};

    for (let i = 0; i < data.length; i += 16) {
      const alpha = data[i + 3];
      if (alpha < 128) {
        continue;
      }

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if ((r > 240 && g > 240 && b > 240) || (r < 20 && g < 20 && b < 20)) {
        continue;
      }

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      colorBucket[hex] = (colorBucket[hex] ?? 0) + 1;
    }

    const palette = Object.keys(colorBucket)
      .sort((a, b) => (colorBucket[b] ?? 0) - (colorBucket[a] ?? 0))
      .slice(0, 4);

    if (palette.length === 0) {
      showToast("Logo terlalu gelap atau terlalu terang untuk sinkron warna.");
      return;
    }

    setLayerColors((prev) => {
      const next = { ...prev };
      for (const id of layerIds) {
        const random = palette[Math.floor(Math.random() * palette.length)] ?? "#ffffff";
        next[id] = random;
      }
      return next;
    });

    showToast("Warna logo berhasil disinkronkan ke aksen sepatu.");
  }, [activeElement, layerIds, loadImage, showToast]);

  const randomizeLayerColors = useCallback(() => {
    setLayerColors((prev) => {
      const next = { ...prev };
      for (const id of layerIds) {
        next[id] = RANDOM_PALETTE[Math.floor(Math.random() * RANDOM_PALETTE.length)] ?? "#ffffff";
      }
      return next;
    });
    showToast("Warna acak diterapkan.");
  }, [layerIds, showToast]);

  const updateActiveText = useCallback(
    (patch: Partial<TextElement>) => {
      if (!activeElement || activeElement.type !== "text") {
        return;
      }
      updateElement(activeElement.id, (item) => {
        if (item.type !== "text") {
          return item;
        }
        return {
          ...item,
          ...patch,
        };
      });
    },
    [activeElement, updateElement],
  );

  const updateActiveLogo = useCallback(
    (patch: Partial<LogoElement>) => {
      if (!activeElement || activeElement.type !== "logo") {
        return;
      }
      updateElement(activeElement.id, (item) => {
        if (item.type !== "logo") {
          return item;
        }
        return {
          ...item,
          ...patch,
        };
      });
    },
    [activeElement, updateElement],
  );

  const drawElementsToCanvas = useCallback(
    async (
      ctx: CanvasRenderingContext2D,
      targetWidth: number,
      targetHeight: number,
      mirror: boolean,
    ): Promise<void> => {
      const ratioX = targetWidth / CANVAS_SIZE;
      const ratioY = targetHeight / CANVAS_SIZE;

      for (const element of customElements) {
        if (element.type === "logo") {
          const image = await loadImage(element.src);
          if (!image) {
            continue;
          }

          const logoHeight = element.size * (element.naturalHeight / element.naturalWidth);
          const drawW = element.size * ratioX;
          const drawH = logoHeight * ratioY;
          const centerX = (element.x + element.size / 2) * ratioX;
          const centerY = (element.y + logoHeight / 2) * ratioY;

          const drawLogoAt = (x: number, y: number, rotationDeg: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((rotationDeg * Math.PI) / 180);
            ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();
          };

          drawLogoAt(centerX, centerY, element.rotation);
          if (mirror) {
            drawLogoAt(centerX, targetHeight - centerY, 180 - element.rotation);
          }
          continue;
        }

        const fontSize = element.size * ratioX;
        const dims = getTextDims(ctx, element.text, fontSize);
        const centerX = (element.x + dims.width / (2 * ratioX)) * ratioX;
        const centerY = (element.y + dims.height / (2 * ratioY)) * ratioY;

        const drawTextAt = (x: number, y: number, rotationDeg: number) => {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((rotationDeg * Math.PI) / 180);
          ctx.font = `800 ${fontSize}px Montserrat, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          if (element.strokeSize > 0) {
            ctx.lineWidth = Math.max(1, element.strokeSize * ratioX * 2);
            ctx.strokeStyle = element.strokeColor;
            ctx.lineJoin = "round";
            ctx.strokeText(element.text, 0, 0);
          }

          ctx.fillStyle = element.color;
          ctx.fillText(element.text, 0, 0);
          ctx.restore();
        };

        drawTextAt(centerX, centerY, element.rotation);
        if (mirror) {
          drawTextAt(centerX, targetHeight - centerY, 180 - element.rotation);
        }
      }
    },
    [customElements, loadImage],
  );

  const createPreviewExportCanvas = useCallback(async (): Promise<HTMLCanvasElement> => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = CANVAS_SIZE;
    exportCanvas.height = CANVAS_SIZE;

    const ctx = exportCanvas.getContext("2d");
    if (!ctx) {
      return exportCanvas;
    }

    const previewCanvas = previewCanvasRef.current;
    if (previewCanvas) {
      ctx.drawImage(previewCanvas, 0, 0);
    }

    await drawElementsToCanvas(ctx, CANVAS_SIZE, CANVAS_SIZE, false);

    const rowOne = `ID/WA: ${phone || "-"} | Nama: ${name || "-"} | Size: ${shoeSize || "-"}`;
    const rowTwo = `Folder: ${folderNo || "-"} | OP: ${operatorName || "-"}`;

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.fillRect(16, CANVAS_SIZE - 92, 460, 64);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.strokeRect(16, CANVAS_SIZE - 92, 460, 64);

    ctx.font = "600 16px Montserrat, sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(rowOne, 26, CANVAS_SIZE - 64);
    ctx.fillText(rowTwo, 26, CANVAS_SIZE - 38);
    ctx.restore();

    return exportCanvas;
  }, [drawElementsToCanvas, phone, name, shoeSize, folderNo, operatorName]);

  const createPatternCanvas = useCallback(async (): Promise<{ canvas: HTMLCanvasElement; watermarkLabel: string }> => {
    const basePattern = await loadFirstAvailableImage(currentModel, [
      `model custom-high ${currentModel}_pola base.svg`,
    ]);

    const patternImages = new Map<LayerId, HTMLImageElement>();
    for (const id of layerIds) {
      const layerPattern = await loadFirstAvailableImage(currentModel, [
        `model custom-high ${currentModel}_pola aksen${id}.svg`,
        `model custom-high ${currentModel}_pola aksen${id}.png.svg`,
      ]);
      if (layerPattern) {
        patternImages.set(id, layerPattern);
      }
    }

    let targetWidth = basePattern?.naturalWidth ?? 2048;
    let targetHeight = basePattern?.naturalHeight ?? 2048;

    for (const image of patternImages.values()) {
      targetWidth = Math.max(targetWidth, image.naturalWidth);
      targetHeight = Math.max(targetHeight, image.naturalHeight);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return {
        canvas,
        watermarkLabel: "POLA_UNKNOWN",
      };
    }

    ctx.clearRect(0, 0, targetWidth, targetHeight);

    if (basePattern) {
      const cutlineOutline = drawOutlineLayer(basePattern, "#000000", 15, targetWidth, targetHeight);
      ctx.drawImage(cutlineOutline, 0, 0);
    }

    const ratioX = targetWidth / CANVAS_SIZE;

    for (const id of layerIds) {
      const image = patternImages.get(id);
      if (!image) {
        continue;
      }

      const outline = layerOutlines[id];
      if (outline?.active) {
        const outlineCanvas = drawOutlineLayer(
          image,
          outline.color,
          outline.size * ratioX,
          targetWidth,
          targetHeight,
        );
        ctx.drawImage(outlineCanvas, 0, 0);
      }

      const fillCanvas = drawFilledLayer(image, layerColors[id] ?? "#ffffff", targetWidth, targetHeight);
      ctx.drawImage(fillCanvas, 0, 0);
    }

    await drawElementsToCanvas(ctx, targetWidth, targetHeight, true);

    const phoneLast4 = phone.replace(/\D/g, "").slice(-4) || "0000";
    const safeName = sanitizeFileToken(name || "NONAME");
    const safeFolder = sanitizeFileToken(folderNo || "NOFOLDER");
    const safeOperator = sanitizeFileToken(operatorName || "NOOP");
    const watermarkLabel = `POLA_${safeName}_WA${phoneLast4}_F${safeFolder}_OP-${safeOperator}`;

    ctx.save();
    const labelFontSize = Math.max(30, targetHeight * 0.015);
    const wmX = Math.min(WATERMARK_X, targetWidth * 0.6);
    const wmY = Math.min(WATERMARK_Y, targetHeight * 0.82);

    ctx.font = `800 ${labelFontSize}px Montserrat, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(wmX, wmY);
    ctx.rotate((WATERMARK_ANGLE * Math.PI) / 180);

    ctx.lineWidth = 8;
    ctx.strokeStyle = "#000000";
    ctx.strokeText(watermarkLabel, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(watermarkLabel, 0, 0);
    ctx.restore();

    return {
      canvas,
      watermarkLabel,
    };
  }, [
    currentModel,
    layerIds,
    layerOutlines,
    layerColors,
    drawElementsToCanvas,
    loadFirstAvailableImage,
    phone,
    name,
    folderNo,
    operatorName,
  ]);

  const downloadCanvas = useCallback((canvas: HTMLCanvasElement, fileName: string) => {
    const anchor = document.createElement("a");
    anchor.download = fileName;
    anchor.href = canvas.toDataURL("image/png");
    anchor.click();
  }, []);

  const handleSave = useCallback(async () => {
    if (!name || !phone || !shoeSize || !folderNo || !operatorName) {
      window.alert("Mohon isi semua data wajib: nama, WhatsApp, ukuran, folder, dan operator.");
      return;
    }

    setIsSaving(true);

    try {
      const previewCanvas = await createPreviewExportCanvas();
      const pattern = await createPatternCanvas();

      const phoneLast4 = phone.replace(/\D/g, "").slice(-4) || "0000";
      const safeName = sanitizeFileToken(name);
      const safeFolder = sanitizeFileToken(folderNo);
      const safeOperator = sanitizeFileToken(operatorName);

      const previewName = `PREVIEW_${safeName}_WA${phoneLast4}_F${safeFolder}_OP-${safeOperator}.png`;
      const patternName = `${pattern.watermarkLabel}.png`;

      downloadCanvas(previewCanvas, previewName);
      downloadCanvas(pattern.canvas, patternName);

      const waTarget = normalizePhoneForWa(phone);
      const waMessage = encodeURIComponent(WHATSAPP_TEMPLATE);
      setWaLink(`https://wa.me/${waTarget}?text=${waMessage}`);
      showToast("File preview dan pola berhasil diunduh.");
    } catch {
      window.alert("Terjadi kesalahan saat memproses desain. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }, [
    name,
    phone,
    shoeSize,
    folderNo,
    operatorName,
    createPreviewExportCanvas,
    createPatternCanvas,
    downloadCanvas,
    showToast,
  ]);

  const updateLayerColor = useCallback((id: LayerId, color: string) => {
    setLayerColors((prev) => ({
      ...prev,
      [id]: color,
    }));
  }, []);

  const toggleLayerOutline = useCallback((id: LayerId, enabled: boolean) => {
    setLayerOutlines((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        active: enabled,
      },
    }));
  }, []);

  const updateLayerOutlineColor = useCallback((id: LayerId, color: string) => {
    setLayerOutlines((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        color,
      },
    }));
  }, []);

  const updateLayerOutlineSize = useCallback((id: LayerId, size: number) => {
    setLayerOutlines((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        size,
      },
    }));
  }, []);

  const handleViewerClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (pointerMovedRef.current) {
        pointerMovedRef.current = false;
        return;
      }

      const target = event.target as HTMLElement;
      if (target.closest('[data-draggable="true"]')) {
        return;
      }

      setActiveElementId(null);

      const viewer = viewerRef.current;
      if (!viewer) {
        return;
      }

      const rect = viewer.getBoundingClientRect();
      const x = ((event.clientX - rect.left) * CANVAS_SIZE) / rect.width;
      const y = ((event.clientY - rect.top) * CANVAS_SIZE) / rect.height;

      const hitCanvas = document.createElement("canvas");
      hitCanvas.width = 1;
      hitCanvas.height = 1;
      const hitCtx = hitCanvas.getContext("2d", { willReadFrequently: true });
      if (!hitCtx) {
        return;
      }

      const reversedIds = [...layerIds].sort((a, b) => b - a);
      for (const id of reversedIds) {
        const image = layerImagesRef.current.get(id);
        if (!image) {
          continue;
        }

        hitCtx.clearRect(0, 0, 1, 1);
        hitCtx.drawImage(image, -x, -y, CANVAS_SIZE, CANVAS_SIZE);
        const alpha = hitCtx.getImageData(0, 0, 1, 1).data[3];
        if (alpha > 20) {
          setActiveLayerPickId(id);
          const picker = colorPickerRef.current;
          if (picker) {
            picker.value = layerColors[id] ?? "#ffffff";
            picker.click();
          }
          showToast(`Aksen ${id} dipilih.`);
          return;
        }
      }
    },
    [layerIds, layerColors, showToast],
  );

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const drag = dragRef.current;
    const viewer = viewerRef.current;
    if (!drag || !viewer) {
      return;
    }

    const rect = viewer.getBoundingClientRect();
    const dx = ((event.clientX - drag.startClientX) * CANVAS_SIZE) / rect.width;
    const dy = ((event.clientY - drag.startClientY) * CANVAS_SIZE) / rect.height;

    if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
      pointerMovedRef.current = true;
    }

    setCustomElements((prev) =>
      prev.map((item) => {
        if (item.id !== drag.id) {
          return item;
        }
        return {
          ...item,
          x: drag.initX + dx,
          y: drag.initY + dy,
        };
      }),
    );
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const startDragElement = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, id: string) => {
      event.preventDefault();
      event.stopPropagation();

      const item = customElements.find((el) => el.id === id);
      if (!item) {
        return;
      }

      setActiveElementId(id);
      pointerMovedRef.current = false;

      dragRef.current = {
        id,
        startClientX: event.clientX,
        startClientY: event.clientY,
        initX: item.x,
        initY: item.y,
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [customElements, handlePointerMove, handlePointerUp],
  );

  useEffect(() => {
    loadModelAssets(currentModel, false).catch(() => {
      setIsSyncing(false);
      showToast("Gagal memuat model.");
    });
  }, [currentModel, loadModelAssets, showToast]);

  useEffect(() => {
    scheduleDraw();
  }, [assetRevision, layerColors, layerOutlines, layerIds, scheduleDraw]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width && width > 0) {
        setViewerWidth(width);
      }
    });

    observer.observe(viewer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (drawFrameRef.current !== null) {
        window.cancelAnimationFrame(drawFrameRef.current);
      }
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const modelButtons = useMemo(() => {
    const items: number[] = [];
    for (let i = 1; i <= MODEL_COUNT; i += 1) {
      items.push(i);
    }
    return items;
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2ff_34%,#f8fafc_100%)] px-4 pb-24 pt-6 md:px-6 md:pb-16 md:pt-10">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-20 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white/80 px-6 py-5 shadow-lg backdrop-blur-md">
          <p className="font-zen text-xs uppercase tracking-[0.22em] text-emerald-700">Bogorsneakers Internal</p>
          <h1 className="mt-2 font-zen text-2xl font-black text-slate-900 md:text-3xl">Design Studio Custom Sepatu</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
            Studio ini memakai source SVG asli dari folder CASUAL HIGH. Semua warna aksen, teks, logo, pola,
            dan file output diproses langsung dari aset internal Anda.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-4">
            <div
              ref={viewerRef}
              className="relative mx-auto aspect-square w-full max-w-190 overflow-hidden rounded-3xl border border-slate-200 bg-[radial-gradient(circle,#ffffff_0%,#eef2f7_100%)] shadow-[0_24px_70px_-24px_rgba(15,23,42,0.38)]"
              onClick={handleViewerClick}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setActiveElementId(null);
                }
              }}
              aria-label="Area preview desain sepatu"
            >
              <canvas
                ref={previewCanvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="h-full w-full"
                aria-hidden="true"
              />

              <div className="pointer-events-none absolute inset-0">
                {customElements.map((item) => {
                  const isActive = item.id === activeElementId;
                  if (item.type === "text") {
                    const style: CSSProperties = {
                      transform: `translate(${item.x * scale}px, ${item.y * scale}px) rotate(${item.rotation}deg)`,
                      fontSize: `${item.size * scale}px`,
                      color: item.color,
                      WebkitTextStroke: `${item.strokeSize * scale}px ${item.strokeColor}`,
                    };
                    return (
                      <div
                        key={item.id}
                        data-draggable="true"
                        role="button"
                        tabIndex={0}
                        className={`pointer-events-auto absolute left-0 top-0 select-none whitespace-nowrap font-black leading-none ${
                          isActive ? "outline-2 outline-dashed outline-emerald-500" : ""
                        }`}
                        style={style}
                        onPointerDown={(event) => startDragElement(event, item.id)}
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveElementId(item.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setActiveElementId(item.id);
                          }
                        }}
                        aria-label={`Elemen teks ${item.text}`}
                      >
                        {item.text}
                      </div>
                    );
                  }

                  const ratio = item.naturalHeight / item.naturalWidth;
                  const style: CSSProperties = {
                    transform: `translate(${item.x * scale}px, ${item.y * scale}px) rotate(${item.rotation}deg)`,
                    width: `${item.size * scale}px`,
                    height: `${item.size * ratio * scale}px`,
                    filter: "drop-shadow(0 3px 6px rgba(15, 23, 42, 0.25))",
                  };

                  return (
                    <div
                      key={item.id}
                      data-draggable="true"
                      role="button"
                      tabIndex={0}
                      className={`pointer-events-auto absolute left-0 top-0 ${
                        isActive ? "outline-2 outline-dashed outline-emerald-500" : ""
                      }`}
                      style={style}
                      onPointerDown={(event) => startDragElement(event, item.id)}
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveElementId(item.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setActiveElementId(item.id);
                        }
                      }}
                      aria-label="Elemen logo"
                    >
                      <NextImage
                        src={item.src}
                        alt="Logo custom"
                        width={item.naturalWidth}
                        height={item.naturalHeight}
                        unoptimized
                        className="pointer-events-none h-full w-full object-contain"
                        draggable={false}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pointer-events-none absolute bottom-4 left-4 rounded-md border-l-4 border-emerald-500 bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-lg backdrop-blur-sm">
                <p>
                  ID/WA: <span>{phone || "-"}</span> | Nama: <span>{name || "-"}</span> | Size: <span>{shoeSize || "-"}</span>
                </p>
                <p className="mt-0.5">
                  Folder: <span>{folderNo || "-"}</span> | OP: <span>{operatorName || "-"}</span>
                </p>
              </div>

              {isSyncing && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-950/80 text-center text-white backdrop-blur-sm">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-emerald-400" />
                  <div>
                    <p className="font-zen text-lg font-bold tracking-wide">Sinkronisasi Model</p>
                    <p className="mt-1 text-sm text-emerald-300">Sedang memuat aset SVG dari katalog internal...</p>
                  </div>
                </div>
              )}
            </div>

            <p className="mx-auto max-w-190 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-center text-sm font-semibold text-sky-700">
              Tips: drag elemen logo/teks langsung di preview, lalu klik area sepatu untuk ubah warna aksen secara cepat.
            </p>
          </div>

          <div className="space-y-5">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-zen text-base font-black text-slate-900">1. Pilih Model Sepatu</h2>
              <div className="mt-4 grid gap-3">
                <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600" htmlFor="kategori">
                  Tipe Sol
                </label>
                <select
                  id="kategori"
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800"
                  value="casual-high"
                  disabled
                  aria-label="Kategori model"
                >
                  <option value="casual-high">Casual High (source SVG internal)</option>
                </select>

                <div className="grid grid-cols-4 gap-2">
                  {modelButtons.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`rounded-xl border px-2 py-2 text-xs font-extrabold transition-colors ${
                        item === currentModel
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                      }`}
                      onClick={() => setCurrentModel(item)}
                    >
                      M{item}
                    </button>
                  ))}
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-zen text-base font-black text-slate-900">2. Tambah Elemen Desain</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-slate-700 transition-colors hover:bg-slate-100"
                  onClick={addTextElement}
                >
                  <Type size={14} /> Teks Baru
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-slate-700 transition-colors hover:bg-slate-100"
                  onClick={() => logoUploadRef.current?.click()}
                >
                  <ImagePlus size={14} /> Logo Baru
                </button>
                <input
                  ref={logoUploadRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(event) => {
                    addLogoElement(event).catch(() => {
                      showToast("Logo gagal ditambahkan.");
                    });
                  }}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                {!activeElement && (
                  <p className="text-center text-xs font-semibold text-slate-500">
                    Klik elemen pada preview untuk mengedit properti.
                  </p>
                )}

                {activeElement && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-700">
                        {activeElement.type === "text" ? "Edit Teks" : "Edit Logo"}
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md bg-rose-500 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white hover:bg-rose-600"
                        onClick={removeActiveElement}
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    </div>

                    {activeElement.type === "text" && (
                      <>
                        <input
                          type="text"
                          value={activeElement.text}
                          onChange={(event) => updateActiveText({ text: event.target.value })}
                          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
                          aria-label="Isi teks"
                        />

                        <div className="grid grid-cols-3 gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                            Warna
                            <input
                              type="color"
                              value={activeElement.color}
                              onChange={(event) => updateActiveText({ color: event.target.value })}
                              className="mt-1 h-8 w-full cursor-pointer rounded-md border border-slate-200"
                              aria-label="Warna teks"
                            />
                          </label>

                          <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                            Stroke
                            <input
                              type="color"
                              value={activeElement.strokeColor}
                              onChange={(event) => updateActiveText({ strokeColor: event.target.value })}
                              className="mt-1 h-8 w-full cursor-pointer rounded-md border border-slate-200"
                              aria-label="Warna stroke teks"
                            />
                          </label>

                          <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                            Tebal
                            <input
                              type="number"
                              value={activeElement.strokeSize}
                              min={0}
                              max={40}
                              onChange={(event) => updateActiveText({ strokeSize: Number(event.target.value) })}
                              className="mt-1 h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                              aria-label="Ketebalan stroke"
                            />
                          </label>
                        </div>
                      </>
                    )}

                    {activeElement.type === "logo" && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            syncLogoColorsToLayers().catch(() => {
                              showToast("Sinkron warna gagal.");
                            });
                          }}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-white hover:bg-sky-700"
                        >
                          <Paintbrush size={14} /> Sinkron Warna ke Aksen
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              removeLogoBackground().catch(() => {
                                showToast("Hapus background gagal.");
                              });
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-700 hover:bg-slate-100"
                          >
                            Hapus BG
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              addLogoOutline().catch(() => {
                                showToast("Tambah outline gagal.");
                              });
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-700 hover:bg-slate-100"
                          >
                            Outline Putih
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                        Ukuran (px)
                        <input
                          type="number"
                          value={activeElement.size}
                          min={20}
                          max={500}
                          onChange={(event) => {
                            const size = Math.max(20, Number(event.target.value));
                            if (activeElement.type === "text") {
                              updateActiveText({ size });
                            } else {
                              updateActiveLogo({ size });
                            }
                          }}
                          className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                          aria-label="Ukuran elemen"
                        />
                      </label>
                      <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                        Putar (deg)
                        <input
                          type="number"
                          value={activeElement.rotation}
                          min={-360}
                          max={360}
                          onChange={(event) => {
                            const rotation = Number(event.target.value);
                            if (activeElement.type === "text") {
                              updateActiveText({ rotation });
                            } else {
                              updateActiveLogo({ rotation });
                            }
                          }}
                          className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                          aria-label="Rotasi elemen"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-zen text-base font-black text-slate-900">3. Kustomisasi Warna Aksen</h2>

              <button
                type="button"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.09em] text-white shadow-md hover:bg-amber-600"
                onClick={randomizeLayerColors}
              >
                <WandSparkles size={14} /> Rekomendasi Warna Acak
              </button>

              <div className="mt-4 space-y-3">
                {layerIds.length === 0 && (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                    Layer aksen belum tersedia pada model ini.
                  </p>
                )}

                {layerIds.map((id) => {
                  const outline = layerOutlines[id];
                  return (
                    <div key={id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-slate-800">Aksen {id}</p>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          Warna
                          <input
                            type="color"
                            value={layerColors[id] ?? "#ffffff"}
                            onChange={(event) => updateLayerColor(id, event.target.value)}
                            className="h-8 w-8 cursor-pointer rounded-full border border-slate-300"
                            aria-label={`Warna aksen ${id}`}
                          />
                        </label>
                      </div>

                      <div className="mt-2 border-t border-slate-200 pt-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <input
                            type="checkbox"
                            checked={outline?.active ?? false}
                            onChange={(event) => toggleLayerOutline(id, event.target.checked)}
                          />
                          Aktifkan outline aksen
                        </label>

                        {outline?.active && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                              Warna Outline
                              <input
                                type="color"
                                value={outline.color}
                                onChange={(event) => updateLayerOutlineColor(id, event.target.value)}
                                className="mt-1 h-8 w-full cursor-pointer rounded-md border border-slate-300"
                                aria-label={`Warna outline aksen ${id}`}
                              />
                            </label>
                            <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600">
                              Tebal Outline
                              <input
                                type="number"
                                value={outline.size}
                                min={1}
                                max={50}
                                onChange={(event) => updateLayerOutlineSize(id, Number(event.target.value))}
                                className="mt-1 h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                                aria-label={`Tebal outline aksen ${id}`}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-3xl border-2 border-emerald-400 bg-emerald-50/70 p-5 shadow-sm">
              <h2 className="font-zen text-base font-black text-slate-900">4. Konfirmasi Pesanan</h2>

              <div className="mt-4 grid gap-3">
                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                  Nama Lengkap
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
                    placeholder="Wajib diisi"
                  />
                </label>

                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                  Nomor WhatsApp
                  <input
                    type="text"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
                    placeholder="Wajib diisi"
                    inputMode="numeric"
                  />
                </label>

                <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                  Ukuran Sepatu
                  <select
                    value={shoeSize}
                    onChange={(event) => setShoeSize(event.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
                  >
                    <option value="">Pilih ukuran</option>
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const value = 36 + idx;
                      return (
                        <option key={value} value={String(value)}>
                          Size {value}
                        </option>
                      );
                    })}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                    No Folder
                    <input
                      type="text"
                      value={folderNo}
                      onChange={(event) => setFolderNo(event.target.value)}
                      className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
                      placeholder="Wajib"
                    />
                  </label>
                  <label className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                    Operator
                    <input
                      type="text"
                      value={operatorName}
                      onChange={(event) => setOperatorName(event.target.value)}
                      className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
                      placeholder="Wajib"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    handleSave().catch(() => {
                      setIsSaving(false);
                      window.alert("Gagal menyimpan desain.");
                    });
                  }}
                  disabled={isSaving || isSyncing}
                >
                  <Download size={15} /> {isSaving ? "Memproses File..." : "Simpan dan Download"}
                </button>

                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-extrabold uppercase tracking-widest text-white shadow-md"
                  >
                    Kirim Konfirmasi ke Pembeli
                  </a>
                )}
              </div>
            </article>

            <button
              type="button"
              onClick={() => {
                loadModelAssets(currentModel, true).catch(() => {
                  setIsSyncing(false);
                  showToast("Sinkronisasi gagal.");
                });
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-400 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-100"
            >
              <RefreshCw size={14} /> Sinkronisasi Katalog Baru
            </button>
          </div>
        </div>
      </div>

      <input
        ref={colorPickerRef}
        type="color"
        className="sr-only"
        onChange={(event) => {
          if (activeLayerPickId == null) {
            return;
          }
          updateLayerColor(activeLayerPickId, event.target.value);
        }}
      />

      {toastMessage && (
        <div
          className="fixed bottom-24 left-1/2 z-60 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xl"
          role="status"
          aria-live="polite"
        >
          {toastMessage}
        </div>
      )}
    </section>
  );
}
