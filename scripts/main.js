/*jslint browser:true */
/*global $: false */
'use strict';


$(document).ready(function () {

    $('.test-composit').each(function () {
        var isLoaded = $(this).get(0).complete;

        if (isLoaded) {
            transparentizeJPG($(this), 'composit');
        } else {
            $(this).load(function () {
                transparentizeJPG($(this), 'composit');
            });
        }
    });

    $('.test-alpha').each(function () {
        var isLoaded = $(this).get(0).complete;

        if (isLoaded) {
            transparentizeJPG($(this), 'alpha');
        } else {
            $(this).load(function () {
                transparentizeJPG($(this), 'alpha');
            });
        }
    });
});


function transparentizeJPG($img, type) {
    var imgW = $img[0].width,
        imgH = $img[0].height,
        maskPath = $img.data('mask'),
        mask = new Image();

    // create image for mask
    mask.src = maskPath;
    mask.onload = function () {
        // start transparentize
        if (type === 'composit') {
            composit();
        }

        if (type === 'alpha') {
            alpha();
        }
    };


    function composit() {
        var $canvas = $('<canvas>'),
            ctx = $canvas[0].getContext('2d');

        // setup dimensions
        // - setting w/h of the canvas with jQuery wont work
        // $('<canvas>', {width: imgW, height: imgH}); = NO FUN
        $canvas[0].width = imgW;
        $canvas[0].height = imgH;

        // canvas layers composition type
        // (how canvas layers affect each other)
        ctx.globalCompositeOperation = "xor";

        // draw images
        ctx.drawImage(mask, 0, 0, imgW, imgH);
        ctx.drawImage($img[0], 0, 0, imgW, imgH);

        // replace Img source
        $img[0].src = $canvas[0].toDataURL();
    }



    function alpha() {
        var $canvasImg = $('<canvas>'),
            $canvasMask = $('<canvas>'),
            ctxImg = $canvasImg[0].getContext('2d'),
            ctxMask = $canvasMask[0].getContext('2d'),
            imgData,
            maskData;

        // setup dimensions
        $canvasImg[0].width = $canvasMask[0].width = imgW;
        $canvasImg[0].height = $canvasMask[0].height = imgH;

        // draw images
        ctxImg.drawImage($img[0], 0, 0, imgW, imgH);
        ctxMask.drawImage(mask, 0, 0, imgW, imgH);

        // get image pixels (RGB + A)
        imgData = ctxImg.getImageData(0, 0, imgW, imgH);
        maskData = ctxMask.getImageData(0, 0, imgW, imgH);

        // replace alpha channel value
        for (var i = 3, len = imgData.data.length; i < len; i = i + 4) {
            imgData.data[i] = maskData.data[i-1];
        }

        // draw img on canvas
        ctxImg.putImageData(imgData, 0, 0, 0, 0, imgW, imgH);

        // replace Img source
        $img[0].src = $canvasImg[0].toDataURL();
    }
}