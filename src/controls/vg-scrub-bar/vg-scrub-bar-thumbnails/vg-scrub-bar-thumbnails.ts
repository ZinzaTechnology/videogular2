import {
    Component, 
    ElementRef, 
    Input, 
    HostListener,  
    ViewEncapsulation, 
    HostBinding,
    OnInit,
    OnChanges,
    OnDestroy,
    SimpleChange
} from '@angular/core';
import { VgAPI } from '../../../core/services/vg-api';
import { VgControlsHidden } from './../../../core/services/vg-controls-hidden';
import { VgStates } from '../../../core/states/vg-states';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'vg-scrub-bar-thumbnails',
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="thumbnails-container" [hidden]="isHidden()" [ngStyle]="thumbContainer">
            <div class="image-thumbnail" [ngStyle]="thumb"></div>
        </div>
        `,
        styles: [ `        
        vg-scrub-bar-thumbnails .thumbnails-container {
            position: relative;
            display: flex;
            flex-grow: 1;
            align-items: center;
            height: 100%;
        }

        vg-scrub-bar vg-scrub-bar-thumbnails {
            user-select: none;
            align-items: center;
            cursor: pointer;
            width: 100%;
            position: relative;
            bottom: 0;
            background: transparent;
            height: 5px;
            flex-grow: 1;
            flex-basis: 0;
            margin: 0;
            -webkit-transition: initial;
            -khtml-transition: initial;
            -moz-transition: initial;
            -ms-transition: initial;
            transition: initial;
            z-index: 250;
        }
    ` ]
})
export class VgScrubBarThumbnails implements OnInit, OnDestroy {
    @Input() vgFor: string;
    @Input() vgThumbnails: [any];
    
    elem: HTMLElement;
    target: any;
    subscriptions: Subscription[] = [];
    onLoadedMetadataCalled: boolean = false;
    
    thumbWidth = 0;
    thumbHeight = 0;
    thumb: any;
    thumbContainer = {};
    srubBar: any;
    
    constructor(ref: ElementRef, public API: VgAPI) {
        this.elem = ref.nativeElement;
    }

    ngOnInit() {
        this.thumb = false;
        if (this.API.isPlayerReady) {
            this.onPlayerReady();
        }
        else {
            this.subscriptions.push(this.API.playerReadyEvent.subscribe(() => this.onPlayerReady()));
        }
    }

    onPlayerReady() {
        this.target = this.API.getMediaById(this.vgFor);
        this.srubBar = this.elem.parentElement;
        this.loadThumbnails();
        //this.addEventListener('mousemove', this.onMouseMove.bind(this));
        //this.srubBar.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        //this.srubBar.addEventListener('mouseout', this.onMouseOut.bind(this));
    }
    
    protected loadThumbnails() {
        if(this.vgThumbnails.length > 0) {
            for (var l = this.vgThumbnails.length, i = 0; i < l; i++) {
                let thLoader = new Image();
                thLoader.onload = this.onLoadThumbnail.bind(this);
                thLoader.src = this.vgThumbnails[i].lowResImage;
            }
        }
    }
    
    protected getTouchOffset(event: any) {
        let offsetLeft: number = 0;
        let element: any = event.target;
        while (element) {
            offsetLeft += element.offsetLeft;
            element = element.offsetParent;
        }
        return event.touches[ 0 ].pageX - offsetLeft;
    }
    
    protected onLoadThumbnail(event) {
        this.thumbWidth = event.currentTarget.naturalWidth;
        this.thumbHeight = event.currentTarget.naturalHeight;
    };
    
    protected updateThumbnails(percentage) {
        let second = Math.round(percentage * this.target.time.total / 100);
        let thPos = (this.srubBar.scrollWidth * percentage / 100) - (this.thumbWidth / 2);
        let maxPos = this.srubBar.scrollWidth  - this.thumbWidth;
        thPos = thPos < 0 ? 0 : thPos;
        thPos = thPos > maxPos? maxPos: thPos;

        if(this.thumbWidth == 0) {
            this.loadThumbnails();
        }
        
        this.thumbContainer = {
            "width": this.thumbWidth + "px",
            "left": thPos + "px",
            "top": - (this.thumbHeight / 2 + 5) + "px",
            "position": "absolute"
        };
        this.thumb = {
            "background-image": 'none'
        };
        
        if (this.vgThumbnails && this.vgThumbnails.length > 0) {
            var th;
            if(this.vgThumbnails[0].timeIndex > second) {
                th = this.vgThumbnails[0];
            }
            for (var l = this.vgThumbnails.length, i = l - 1; i >= 0; i--) {
                if (this.vgThumbnails[i].timeIndex <= second) {
                    th = this.vgThumbnails[i];
                    break;
                }
            }
            this.thumb = {
                "background-image": 'url("' + th.lowResImage + '")',
                "width": this.thumbWidth + "px",
                "height": this.thumbHeight + "px"
            };
        }
    }
    
    isHidden() {
        return this.thumb ? (this. thumb["background-image"] != 'none' ? false : true) : true;
    }
    onMouseMove($event: any) {
        //let offset = this.getTouchOffset($event);
        let offset = $event.clientX;
        //console.log("clientX=" + $event.clientX + ",  clientY=" + $event.clientY + ",  offsetX=" + $event.offsetX + ",  offsetY=" + $event.offsetY);
        let percentage = Math.max(Math.min(offset * 100 / this.srubBar.scrollWidth, 99.9), 0);
        this.updateThumbnails(percentage);
    }
    
    onMouseLeave($event: any) {
        this.thumb = false;
    }
    
    onMouseOut($event: any) {
        this.thumb = false;
    }
    

    @HostListener('mousemove', [ '$event' ])
    onMouseMoveThumbnailBar($event: any) {
        this.onMouseMove($event);
    }

    @HostListener('mouseleave', [ '$event' ]) 
    onMouseLeaveThumbnailBar($event: any) {
        this.onMouseLeave($event);
    }

    getPercentage() {
        return this.target ? ((this.target.time.current * 100) / this.target.time.total) + '%' : '0%';
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}