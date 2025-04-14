import { getChatContentStoreData } from "../store"
import { eventBUS } from "@/views/Home/utils/tools"

/**
 * @description 滚动条
 */
export function scrollMove() {
    const {
        userScrollSelf,
        scrollRef,
    } = getChatContentStoreData()
    let timer: any = null
    return (delay: number) => {
        if (!timer) {
            timer = setTimeout(() => {
                const scrollWrapper = document.querySelector("#scroll-bar .n-scrollbar-content") as HTMLDivElement
                if (userScrollSelf.value) {
                    clearTimeout(timer)
                    timer = null
                    return
                }
                if (scrollRef.value) {
                    scrollRef.value.scrollTo({
                        top: scrollWrapper.offsetHeight,
                        behavior: "instant"
                    })
                    clearTimeout(timer)
                }
                timer = null
            }, delay)
        }
    }
}


/**
 * @description 滚动回调:用来记录当前滚动的高度，便于判断是否用户手动停止滚动
 *  */
export function scrollCallback(e: any) {
    const {
        userScrollSelf,
        scrollTop,
    } = getChatContentStoreData()
    if (scrollTop.value < e.target.scrollTop) {
        userScrollSelf.value = false
    } else {
        userScrollSelf.value = true
    }
    scrollTop.value = e.target.scrollTop
}

/**
 * @description 鼠标离开
 *      - 鼠标离开chat-window后，如果当前正在对话，则开启滚动，滑动到最底部
 */
export function mouseLeave() {
    const {
        userScrollSelf,
        isInChat,
    } = getChatContentStoreData()
    userScrollSelf.value = false
    if (isInChat.value) {
        eventBUS.$emit("doScroll")
    }
}