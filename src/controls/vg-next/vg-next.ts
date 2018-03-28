import { Component, ElementRef, HostListener, OnInit, Input, ViewEncapsulation, OnDestroy } from '@angular/core';
import { VgAPI } from '../../core/services/vg-api';
import { VgStates } from '../../core/states/vg-states';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'vg-next',
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="icon"
             [class.vg-icon-skip_next]="true"
             tabindex="0"
             role="button"
             aria-label="play next button"
             [attr.aria-valuetext]="ariaValue">
        </div>
        <div class="next-thumb-container" [style.display]="isHidden? 'none': 'block'" [ngStyle]="thumbContainer" [style.opacity]="0.8">
            <div class="image-thumbnail" [ngStyle]="thumb"></div>
            <div class="detail-next-video" [textContent]="nextVideoDetail"></div>
        </div>`,
    styles: [ `
        vg-next {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            display: flex;
            justify-content: center;
            height: 50px;
            width: 50px;
            cursor: pointer;
            color: white;
        }
        vg-next .icon {
            pointer-events: none;
        }
        
        vg-next .next-thumb-container {
            background-color: black;
        }
        
        vg-next .next-thumb-container .image-thumbnail {
            float: left;
            margin: 5px;
        }
        
        vg-next .next-thumb-container .detail-next-video{
            font-size: medium;
            color: white;
        }
    ` ]
})
export class VgNext implements OnInit, OnDestroy {
    @Input() vgFor: string;
    @Input() vgNextVideo: any;

    elem: HTMLElement;
    target: any;
    subscriptions: Subscription[] = [];
    ariaValue = "";
    
    thumbWidth = 0;
    thumbHeight = 0;
    thumb: any;
    thumbContainer = {};
    nextVideoDetail = "";

    constructor(ref: ElementRef, public API: VgAPI) {
        this.elem = ref.nativeElement;
    }

    ngOnInit() {
        if (this.API.isPlayerReady) {
            this.onPlayerReady();
        }
        else {
            this.subscriptions.push(this.API.playerReadyEvent.subscribe(() => this.onPlayerReady()));
        }
    }

    onPlayerReady() {
        this.target = this.API.getMediaById(this.vgFor);
    }
    
    protected updateThumbnails() {
        if(!this.vgNextVideo.fullMedResImagePath) {
            return;
        }
        if(this.thumbWidth == 0) {
            this.loadThumbnails();
        }
        
        this.thumbContainer = {
            "width": this.thumbWidth * 2 + "px",
            "left": "5px",
            "top": - (this.thumbHeight + 15) + "px",
            "position": "absolute"
        };
        this.thumb = {
            "background-image": 'none'
        };
        
        this.thumb = {
            "background-image": 'url("' + this.vgNextVideo.fullMedResImagePath + '")',
            "width": this.thumbWidth + "px",
            "height": this.thumbHeight + "px"
        };
        
        this.nextVideoDetail = this.vgNextVideo.title;
    }
    
    protected loadThumbnails() {
        let thLoader = new Image();
        thLoader.onload = this.onLoadThumbnail.bind(this);
        thLoader.src = this.vgNextVideo.fullMedResImagePath;
    }
    
    protected onLoadThumbnail(event) {
        this.thumbWidth = event.currentTarget.naturalWidth;
        this.thumbHeight = event.currentTarget.naturalHeight;
    };
    
    isHidden() {
        return this.thumb ? (this. thumb["background-image"] != 'none' ? false : true) : true;
    }
    /*
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        // On press Enter (13) or Space (32)
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            this.playNext();
        }
    }
    */
    
    @HostListener('mousemove', [ '$event' ])
    onMouseMovebtnNext($event: any) {
        this.onMouseMove($event);
    }

    @HostListener('mouseleave', [ '$event' ]) 
    onMouseLeavebtnNext($event: any) {
        this.onMouseLeave($event);
    }
    
    onMouseMove($event) {
        this.updateThumbnails();
    }
    
    onMouseLeave($event) {
        this.thumb = false;
    }
    
    onMouseOut($event: any) {
        this.thumb = false;
    }
    
    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}
