import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCw, RotateCcw, ZoomIn, FlipHorizontal, FlipVertical } from 'lucide-react';
import { BaseComponentProps } from '@/types/component.types';

export interface ImageCropperProps extends BaseComponentProps {
  imageSrc: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
  circularCrop?: boolean;
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

export const DynamicImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  open,
  onOpenChange,
  onCropComplete,
  aspectRatio,
  circularCrop = false,
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

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = aspectRatio
      ? centerAspectCrop(width, height, aspectRatio)
      : centerAspectCrop(width, height, 1);
    setCrop(initialCrop);
  }, [aspectRatio]);

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

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        }
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop, rotation, scale, flipH, flipV]);

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
  };

  const rotateLeft = () => setRotation((r) => (r - 90) % 360);
  const rotateRight = () => setRotation((r) => (r + 90) % 360);
  const toggleFlipH = () => setFlipH((f) => !f);
  const toggleFlipV = () => setFlipV((f) => !f);

  if (baseProps.hidden) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{t('imageCropper.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Crop Area */}
          <div className="flex justify-center bg-muted/50 rounded-lg p-4 overflow-hidden">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop={circularCrop}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop"
                onLoad={onImageLoad}
                style={{
                  transform: `rotate(${rotation}deg) scale(${flipH ? -scale : scale}, ${flipV ? -scale : scale})`,
                  maxHeight: '50vh',
                  maxWidth: '100%',
                }}
              />
            </ReactCrop>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Rotation & Flip */}
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
          </div>
        </div>

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
