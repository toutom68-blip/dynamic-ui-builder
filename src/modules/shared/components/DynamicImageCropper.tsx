import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RotateCw, RotateCcw, ZoomIn, FlipHorizontal, FlipVertical, RectangleHorizontal, RectangleVertical, Square, Type, Bold, Palette } from 'lucide-react';
import { BaseComponentProps } from '@/types/component.types';

interface TextOverlay {
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
}

export interface ImageCropperProps extends BaseComponentProps {
  imageSrc: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
  circularCrop?: boolean;
  enableTextOverlay?: boolean;
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

export const DynamicImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  open,
  onOpenChange,
  onCropComplete,
  aspectRatio: initialAspectRatio,
  circularCrop = false,
  enableTextOverlay = true,
  ...baseProps
}) => {
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>(null);
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
      const croppedUrl = await getCroppedImg();
      onCropComplete(croppedUrl);
      onOpenChange(false);
      resetState();
    } catch (error) {
      console.error('Error cropping image:', error);
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
  };

  const rotateLeft = () => setRotation((r) => (r - 90) % 360);
  const rotateRight = () => setRotation((r) => (r + 90) % 360);
  const toggleFlipH = () => setFlipH((f) => !f);
  const toggleFlipV = () => setFlipV((f) => !f);

  if (baseProps.hidden) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{t('imageCropper.title')}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crop">{t('imageCropper.cropTab')}</TabsTrigger>
            {enableTextOverlay && (
              <TabsTrigger value="text">{t('imageCropper.textTab')}</TabsTrigger>
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
                <Label>{t('imageCropper.textOverlay')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    placeholder={t('imageCropper.enterText')}
                    className="flex-1"
                  />
                  <Button onClick={addTextOverlay} disabled={!currentText.trim()}>
                    <Type className="h-4 w-4 mr-2" />
                    {t('imageCropper.addText')}
                  </Button>
                </div>
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

              {/* Added Text List */}
              {textOverlays.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('imageCropper.addedTexts')}</Label>
                  <div className="space-y-2 max-h-32 overflow-auto">
                    {textOverlays.map((overlay, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <span
                          style={{
                            color: overlay.color,
                            fontWeight: overlay.fontWeight,
                          }}
                        >
                          {overlay.text}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTextOverlay(index)}
                        >
                          {t('common.delete')}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview with text */}
              <div className="flex justify-center bg-muted/50 rounded-lg p-4 overflow-hidden">
                <div className="relative">
                  <img
                    src={imageSrc}
                    alt="Preview"
                    style={{
                      maxHeight: '30vh',
                      maxWidth: '100%',
                    }}
                  />
                  {textOverlays.map((overlay, index) => (
                    <div
                      key={index}
                      className="absolute cursor-move"
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
              </div>
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
