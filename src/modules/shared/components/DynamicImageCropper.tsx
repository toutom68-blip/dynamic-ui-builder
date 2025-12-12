import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Canvas as FabricCanvas, PencilBrush, FabricText, FabricImage } from 'fabric';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  RotateCw, RotateCcw, ZoomIn, FlipHorizontal, FlipVertical, 
  RectangleHorizontal, RectangleVertical, Square, Type, Bold, Palette,
  Pen, Pencil, Eraser, Move, Trash2
} from 'lucide-react';
import { BaseComponentProps } from '@/types/component.types';

interface TextOverlay {
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  scaleX?: number;
  scaleY?: number;
}

type DrawingTool = 'select' | 'pen' | 'pencil' | 'eraser' | 'text';

export interface ImageCropperProps extends BaseComponentProps {
  imageSrc: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
  circularCrop?: boolean;
  enableTextOverlay?: boolean;
  enableDrawing?: boolean;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      { unit: '%', width: 90 },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ASPECT_PRESETS = [
  { key: 'free', value: undefined, icon: Square },
  { key: 'square', value: 1, icon: Square },
  { key: 'horizontal', value: 16 / 9, icon: RectangleHorizontal },
  { key: 'vertical', value: 9 / 16, icon: RectangleVertical },
  { key: 'landscape', value: 4 / 3, icon: RectangleHorizontal },
  { key: 'portrait', value: 3 / 4, icon: RectangleVertical },
];

const TEXT_COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
];

const BRUSH_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
];

const FONT_SIZES = [12, 16, 20, 24, 32, 40, 48, 56, 64, 72];

export const DynamicImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  open,
  onOpenChange,
  onCropComplete,
  aspectRatio: initialAspectRatio,
  circularCrop = false,
  enableTextOverlay = true,
  enableDrawing = true,
  ...baseProps
}) => {
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [selectedAspect, setSelectedAspect] = useState<number | undefined>(initialAspectRatio);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textFontSize, setTextFontSize] = useState(24);
  const [textFontWeight, setTextFontWeight] = useState<'normal' | 'bold'>('normal');
  const [activeTab, setActiveTab] = useState('crop');
  const [activeTool, setActiveTool] = useState<DrawingTool>('pen');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [drawingCanvasReady, setDrawingCanvasReady] = useState(false);
  const [draggingTextIndex, setDraggingTextIndex] = useState<number | null>(null);
  const [editingTextIndex, setEditingTextIndex] = useState<number | null>(null);
  const [canvasTextColor, setCanvasTextColor] = useState('#000000');
  const [canvasTextFontSize, setCanvasTextFontSize] = useState(24);
  const [canvasTextScale, setCanvasTextScale] = useState(1);

  // Initialize Fabric canvas when switching to draw tab
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current && !fabricCanvasRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const maxWidth = 600;
        const maxHeight = 400;
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }

        // Set canvas dimensions before creating FabricCanvas
        canvasRef.current!.width = width;
        canvasRef.current!.height = height;

        const canvas = new FabricCanvas(canvasRef.current!, {
          width,
          height,
          isDrawingMode: true,
        });

        // Create and set up the brush properly
        const brush = new PencilBrush(canvas);
        brush.color = brushColor;
        brush.width = brushSize;
        canvas.freeDrawingBrush = brush;

        // Load and add background image
        FabricImage.fromURL(imageSrc, { crossOrigin: 'anonymous' }).then((fabricImg) => {
          const scaleX = width / fabricImg.width!;
          const scaleY = height / fabricImg.height!;
          fabricImg.set({
            left: 0,
            top: 0,
            scaleX,
            scaleY,
            selectable: false,
            evented: false,
            originX: 'left',
            originY: 'top',
          });
          canvas.insertAt(0, fabricImg);
          canvas.renderAll();
        }).catch((err) => {
          console.error('Error loading image:', err);
        });

        fabricCanvasRef.current = canvas;
        setDrawingCanvasReady(true);
      };
      img.onerror = () => {
        console.error('Failed to load image for drawing canvas');
      };
      img.src = imageSrc;
    }

    return () => {
      // Cleanup handled in resetState
    };
  }, [activeTab, imageSrc]);

  // Update brush settings
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      
      // Ensure brush exists
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new PencilBrush(canvas);
      }
      
      if (activeTool === 'eraser') {
        canvas.freeDrawingBrush.color = '#FFFFFF';
        canvas.freeDrawingBrush.width = brushSize * 3;
        canvas.isDrawingMode = true;
      } else if (activeTool === 'pen' || activeTool === 'pencil') {
        canvas.freeDrawingBrush.color = brushColor;
        canvas.freeDrawingBrush.width = activeTool === 'pencil' ? Math.max(1, brushSize * 0.5) : brushSize;
        canvas.isDrawingMode = true;
      } else {
        // Disable drawing mode for select and text tools
        canvas.isDrawingMode = false;
      }
      
      canvas.renderAll();
    }
  }, [activeTool, brushColor, brushSize, drawingCanvasReady]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const aspect = selectedAspect || 1;
    const initialCrop = centerAspectCrop(width, height, aspect);
    setCrop(initialCrop);
  }, [selectedAspect]);

  const handleAspectChange = (aspect: number | undefined) => {
    setSelectedAspect(aspect);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      if (aspect) {
        setCrop(centerAspectCrop(width, height, aspect));
      }
    }
  };

  const addTextOverlay = () => {
    if (!currentText.trim()) return;
    const newOverlay: TextOverlay = {
      text: currentText,
      x: 50,
      y: 50,
      color: textColor,
      fontSize: textFontSize,
      fontWeight: textFontWeight,
    };
    setTextOverlays([...textOverlays, newOverlay]);
    setCurrentText('');
  };

  const removeTextOverlay = (index: number) => {
    setTextOverlays(textOverlays.filter((_, i) => i !== index));
  };

  const handleTextDragStart = (index: number) => {
    setDraggingTextIndex(index);
  };

  const handleTextDrag = (e: React.MouseEvent, containerRect: DOMRect) => {
    if (draggingTextIndex === null) return;
    
    const x = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    const y = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    
    setTextOverlays(prev => prev.map((overlay, i) => 
      i === draggingTextIndex 
        ? { ...overlay, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
        : overlay
    ));
  };

  const handleTextDragEnd = () => {
    setDraggingTextIndex(null);
  };

  const clearDrawing = () => {
    if (fabricCanvasRef.current) {
      const objects = fabricCanvasRef.current.getObjects();
      objects.forEach((obj, index) => {
        if (index > 0) { // Keep background image
          fabricCanvasRef.current?.remove(obj);
        }
      });
      fabricCanvasRef.current.renderAll();
    }
  };

  const addTextToCanvas = () => {
    if (!fabricCanvasRef.current || !currentText.trim()) return;
    
    const text = new FabricText(currentText, {
      left: 100,
      top: 100,
      fontSize: canvasTextFontSize,
      fill: canvasTextColor,
      fontWeight: textFontWeight === 'bold' ? 'bold' : 'normal',
      scaleX: canvasTextScale,
      scaleY: canvasTextScale,
    });
    
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
    setCurrentText('');
  };

  // Update selected text properties
  const updateSelectedText = (property: 'fill' | 'fontSize' | 'scaleX' | 'scaleY', value: string | number) => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject && activeObject.type === 'text') {
      if (property === 'scaleX' || property === 'scaleY') {
        activeObject.set('scaleX', value as number);
        activeObject.set('scaleY', value as number);
      } else {
        activeObject.set(property, value);
      }
      fabricCanvasRef.current.renderAll();
    }
  };

  // Listen for selection changes on canvas
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    const handleSelection = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'text') {
        const textObj = activeObject as FabricText;
        setCanvasTextColor(textObj.fill as string || '#000000');
        setCanvasTextFontSize(textObj.fontSize || 24);
        setCanvasTextScale(textObj.scaleX || 1);
        setActiveTool('text');
      }
    };

    const handleDeselection = () => {
      // Keep last used values
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleDeselection);

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleDeselection);
    };
  }, [drawingCanvasReady]);

  // Edit text overlay in text tab
  const startEditingText = (index: number) => {
    const overlay = textOverlays[index];
    setEditingTextIndex(index);
    setCurrentText(overlay.text);
    setTextColor(overlay.color);
    setTextFontSize(overlay.fontSize);
    setTextFontWeight(overlay.fontWeight);
  };

  // Auto-save text overlay when editing
  useEffect(() => {
    if (editingTextIndex !== null && currentText.trim()) {
      setTextOverlays(prev => prev.map((overlay, i) => 
        i === editingTextIndex 
          ? { 
              ...overlay, 
              text: currentText, 
              color: textColor, 
              fontSize: textFontSize, 
              fontWeight: textFontWeight 
            }
          : overlay
      ));
    }
  }, [currentText, textColor, textFontSize, textFontWeight, editingTextIndex]);

  const finishEditingText = () => {
    setEditingTextIndex(null);
    setCurrentText('');
  };

  const getDrawingDataURL = async (): Promise<string | null> => {
    if (!fabricCanvasRef.current) return null;
    return fabricCanvasRef.current.toDataURL({ multiplier: 1, format: 'png', quality: 1 });
  };

  const getCroppedImg = useCallback(async (): Promise<string> => {
    const image = imgRef.current;
    if (!image || !completedCrop) {
      throw new Error('Crop data not available');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio || 1;
    
    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    const centerX = canvas.width / 2 / pixelRatio;
    const centerY = canvas.height / 2 / pixelRatio;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -scale : scale, flipV ? -scale : scale);
    ctx.translate(-centerX, -centerY);

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width / pixelRatio,
      canvas.height / pixelRatio
    );

    ctx.restore();

    // Draw text overlays
    textOverlays.forEach((overlay) => {
      ctx.save();
      ctx.font = `${overlay.fontWeight} ${overlay.fontSize * pixelRatio}px sans-serif`;
      ctx.fillStyle = overlay.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const textX = (overlay.x / 100) * (canvas.width / pixelRatio);
      const textY = (overlay.y / 100) * (canvas.height / pixelRatio);
      
      // Add text shadow for better visibility
      ctx.shadowColor = overlay.color === '#000000' ? '#FFFFFF' : '#000000';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(overlay.text, textX, textY);
      ctx.restore();
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        }
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop, rotation, scale, flipH, flipV, textOverlays]);

  const handleSave = async () => {
    try {
      let resultUrl: string;
      
      if (activeTab === 'draw' && fabricCanvasRef.current) {
        // If on draw tab, export the canvas
        resultUrl = await getDrawingDataURL() || imageSrc;
      } else {
        resultUrl = await getCroppedImg();
      }
      
      onCropComplete(resultUrl);
      onOpenChange(false);
      resetState();
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setRotation(0);
    setScale(1);
    setFlipH(false);
    setFlipV(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setSelectedAspect(initialAspectRatio);
    setTextOverlays([]);
    setCurrentText('');
    setActiveTab('crop');
    setActiveTool('pen');
    setBrushColor('#000000');
    setBrushSize(3);
    setDrawingCanvasReady(false);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }
  };

  const rotateLeft = () => setRotation((r) => (r - 90) % 360);
  const rotateRight = () => setRotation((r) => (r + 90) % 360);
  const toggleFlipH = () => setFlipH((f) => !f);
  const toggleFlipV = () => setFlipV((f) => !f);

  if (baseProps.hidden) return null;

  const tabCount = 1 + (enableTextOverlay ? 1 : 0) + (enableDrawing ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{t('imageCropper.title')}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-${tabCount}`}>
            <TabsTrigger value="crop">{t('imageCropper.cropTab')}</TabsTrigger>
            {enableTextOverlay && (
              <TabsTrigger value="text">{t('imageCropper.textTab')}</TabsTrigger>
            )}
            {enableDrawing && (
              <TabsTrigger value="draw">{t('imageCropper.drawTab', 'Draw')}</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="crop" className="space-y-4">
            {/* Aspect Ratio Presets */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('imageCropper.aspectRatio')}</Label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <Button
                      key={preset.key}
                      variant={selectedAspect === preset.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAspectChange(preset.value)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {t(`imageCropper.aspects.${preset.key}`)}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Image Crop Area */}
            <div className="flex justify-center bg-muted/50 rounded-lg p-4 overflow-hidden relative">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={selectedAspect}
                circularCrop={circularCrop}
              >
                <div className="relative">
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop"
                    onLoad={onImageLoad}
                    style={{
                      transform: `rotate(${rotation}deg) scale(${flipH ? -scale : scale}, ${flipV ? -scale : scale})`,
                      maxHeight: '40vh',
                      maxWidth: '100%',
                    }}
                  />
                  {/* Text overlay preview */}
                  {textOverlays.map((overlay, index) => (
                    <div
                      key={index}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${overlay.x}%`,
                        top: `${overlay.y}%`,
                        transform: 'translate(-50%, -50%)',
                        color: overlay.color,
                        fontSize: `${overlay.fontSize}px`,
                        fontWeight: overlay.fontWeight,
                        textShadow: overlay.color === '#000000' 
                          ? '1px 1px 2px #FFFFFF' 
                          : '1px 1px 2px #000000',
                      }}
                    >
                      {overlay.text}
                    </div>
                  ))}
                </div>
              </ReactCrop>
            </div>

            {/* Rotation & Flip Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon" onClick={rotateLeft} title={t('imageCropper.rotateLeft')}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={rotateRight} title={t('imageCropper.rotateRight')}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button 
                variant={flipH ? "default" : "outline"} 
                size="icon" 
                onClick={toggleFlipH}
                title={t('imageCropper.flipHorizontal')}
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
              <Button 
                variant={flipV ? "default" : "outline"} 
                size="icon" 
                onClick={toggleFlipV}
                title={t('imageCropper.flipVertical')}
              >
                <FlipVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-4 px-4">
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[scale]}
                onValueChange={([val]) => setScale(val)}
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {Math.round(scale * 100)}%
              </span>
            </div>
          </TabsContent>

          {enableTextOverlay && (
            <TabsContent value="text" className="space-y-4">
              {/* Text Input */}
              <div className="space-y-2">
                <Label>{editingTextIndex !== null ? t('imageCropper.editText', 'Edit Text') : t('imageCropper.textOverlay')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    placeholder={t('imageCropper.enterText')}
                    className="flex-1"
                  />
                  {editingTextIndex !== null ? (
                    <Button variant="outline" onClick={finishEditingText}>
                      {t('common.done', 'Done')}
                    </Button>
                  ) : (
                    <Button onClick={addTextOverlay} disabled={!currentText.trim()}>
                      <Type className="h-4 w-4 mr-2" />
                      {t('imageCropper.addText')}
                    </Button>
                  )}
                </div>
                {editingTextIndex !== null && (
                  <p className="text-xs text-muted-foreground">
                    {t('imageCropper.autoSaveHint', 'Changes are saved automatically')}
                  </p>
                )}
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  {t('imageCropper.textColor')}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        textColor === color ? 'scale-110 border-primary' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label>{t('imageCropper.fontSize')}: {textFontSize}px</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {FONT_SIZES.map((size) => (
                    <Button
                      key={size}
                      variant={textFontSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTextFontSize(size)}
                      className="w-10 h-8"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                <Slider
                  value={[textFontSize]}
                  onValueChange={([val]) => setTextFontSize(val)}
                  min={12}
                  max={72}
                  step={2}
                />
              </div>

              {/* Font Weight */}
              <div className="space-y-2">
                <Label>{t('imageCropper.fontWeight')}</Label>
                <div className="flex gap-2">
                  <Button
                    variant={textFontWeight === 'normal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTextFontWeight('normal')}
                  >
                    {t('imageCropper.normal')}
                  </Button>
                  <Button
                    variant={textFontWeight === 'bold' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTextFontWeight('bold')}
                  >
                    <Bold className="h-4 w-4 mr-2" />
                    {t('imageCropper.bold')}
                  </Button>
                </div>
              </div>

              {/* Added Text List with Edit */}
              {textOverlays.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('imageCropper.addedTexts')}</Label>
                  <div className="space-y-2 max-h-32 overflow-auto">
                    {textOverlays.map((overlay, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded transition-colors ${
                          editingTextIndex === index ? 'bg-primary/20 border border-primary' : 'bg-muted'
                        }`}
                      >
                        <span
                          style={{
                            color: overlay.color,
                            fontWeight: overlay.fontWeight,
                            fontSize: `${Math.min(overlay.fontSize, 16)}px`,
                          }}
                        >
                          {overlay.text}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingText(index)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTextOverlay(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview with draggable text */}
              <div className="flex justify-center bg-muted/50 rounded-lg p-4 overflow-hidden">
                <div 
                  className="relative select-none"
                  onMouseMove={(e) => {
                    if (draggingTextIndex !== null) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      handleTextDrag(e, rect);
                    }
                  }}
                  onMouseUp={handleTextDragEnd}
                  onMouseLeave={handleTextDragEnd}
                >
                  <img
                    src={imageSrc}
                    alt="Preview"
                    style={{
                      maxHeight: '30vh',
                      maxWidth: '100%',
                    }}
                    draggable={false}
                  />
                  {textOverlays.map((overlay, index) => (
                    <div
                      key={index}
                      className={`absolute cursor-move select-none transition-all ${
                        editingTextIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      style={{
                        left: `${overlay.x}%`,
                        top: `${overlay.y}%`,
                        transform: `translate(-50%, -50%) scale(${overlay.scaleX || 1})`,
                        color: overlay.color,
                        fontSize: `${overlay.fontSize}px`,
                        fontWeight: overlay.fontWeight,
                        textShadow: overlay.color === '#000000' 
                          ? '1px 1px 2px #FFFFFF' 
                          : '1px 1px 2px #000000',
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleTextDragStart(index);
                      }}
                      onDoubleClick={() => startEditingText(index)}
                    >
                      <Move className="h-3 w-3 absolute -top-4 left-1/2 -translate-x-1/2 opacity-50" />
                      {overlay.text}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {t('imageCropper.dragTextHint', 'Drag text to reposition. Double-click to edit.')}
              </p>
            </TabsContent>
          )}

          {enableDrawing && (
            <TabsContent value="draw" className="space-y-4">
              {/* Drawing Tools */}
              <div className="space-y-2">
                <Label>{t('imageCropper.drawingTools', 'Drawing Tools')}</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeTool === 'select' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool('select')}
                    className="gap-2"
                  >
                    <Move className="h-4 w-4" />
                    {t('imageCropper.select', 'Select')}
                  </Button>
                  <Button
                    variant={activeTool === 'pen' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool('pen')}
                    className="gap-2"
                  >
                    <Pen className="h-4 w-4" />
                    {t('imageCropper.pen', 'Pen')}
                  </Button>
                  <Button
                    variant={activeTool === 'pencil' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool('pencil')}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    {t('imageCropper.pencil', 'Pencil')}
                  </Button>
                  <Button
                    variant={activeTool === 'eraser' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool('eraser')}
                    className="gap-2"
                  >
                    <Eraser className="h-4 w-4" />
                    {t('imageCropper.eraser', 'Eraser')}
                  </Button>
                  <Button
                    variant={activeTool === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool('text')}
                    className="gap-2"
                  >
                    <Type className="h-4 w-4" />
                    {t('imageCropper.textTool', 'Text')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearDrawing}
                    className="gap-2 ml-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('imageCropper.clearDrawing', 'Clear')}
                  </Button>
                </div>
              </div>

              {/* Brush Color */}
              {(activeTool === 'pen' || activeTool === 'pencil') && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    {t('imageCropper.brushColor', 'Brush Color')}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {BRUSH_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setBrushColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          brushColor === color ? 'scale-110 border-primary' : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Brush Size */}
              {(activeTool === 'pen' || activeTool === 'pencil' || activeTool === 'eraser') && (
                <div className="space-y-2">
                  <Label>
                    {t('imageCropper.brushSize', 'Brush Size')}: {brushSize}px
                  </Label>
                  <Slider
                    value={[brushSize]}
                    onValueChange={([val]) => setBrushSize(val)}
                    min={1}
                    max={20}
                    step={1}
                  />
                </div>
              )}

              {/* Text Tool Settings */}
              {activeTool === 'text' && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <Label className="text-base font-medium">{t('imageCropper.textSettings', 'Text Settings')}</Label>
                  
                  {/* Text Color for Canvas */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      {t('imageCropper.textColor')}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {TEXT_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            setCanvasTextColor(color);
                            updateSelectedText('fill', color);
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${
                            canvasTextColor === color ? 'scale-110 border-primary' : 'border-border'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Font Size for Canvas */}
                  <div className="space-y-2">
                    <Label>{t('imageCropper.fontSize')}: {canvasTextFontSize}px</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {FONT_SIZES.map((size) => (
                        <Button
                          key={size}
                          variant={canvasTextFontSize === size ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setCanvasTextFontSize(size);
                            updateSelectedText('fontSize', size);
                          }}
                          className="w-10 h-8"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                    <Slider
                      value={[canvasTextFontSize]}
                      onValueChange={([val]) => {
                        setCanvasTextFontSize(val);
                        updateSelectedText('fontSize', val);
                      }}
                      min={12}
                      max={72}
                      step={2}
                    />
                  </div>

                  {/* Text Zoom/Scale */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ZoomIn className="h-4 w-4" />
                      {t('imageCropper.textZoom', 'Text Zoom')}: {Math.round(canvasTextScale * 100)}%
                    </Label>
                    <Slider
                      value={[canvasTextScale]}
                      onValueChange={([val]) => {
                        setCanvasTextScale(val);
                        updateSelectedText('scaleX', val);
                      }}
                      min={0.5}
                      max={3}
                      step={0.1}
                    />
                  </div>
                </div>
              )}

              {/* Add Text to Canvas */}
              <div className="space-y-2">
                <Label>{t('imageCropper.addTextToDrawing', 'Add Text')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    placeholder={t('imageCropper.enterText')}
                    className="flex-1"
                  />
                  <Button onClick={addTextToCanvas} disabled={!currentText.trim()}>
                    <Type className="h-4 w-4 mr-2" />
                    {t('imageCropper.addText')}
                  </Button>
                </div>
              </div>

              {/* Drawing Canvas with Photo */}
              <div className="flex justify-center bg-muted/50 rounded-lg p-4 overflow-hidden">
                <canvas 
                  ref={canvasRef}
                  className="border border-border rounded shadow-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {t('imageCropper.drawingHint', 'Draw on the image using the tools above. Click text to edit properties. Text can be moved and scaled.')}
              </p>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('imageCropper.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
