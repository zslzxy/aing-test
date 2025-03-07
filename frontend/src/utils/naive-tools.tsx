import type { ConfigProviderProps, DialogOptions,ModalOptions } from 'naive-ui'
import { createDiscreteApi, darkTheme, lightTheme, NButton } from 'naive-ui'
import { computed, ref } from 'vue'

const themeRef = ref<'light' | 'dark'>('light')
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
    theme: themeRef.value === 'light' ? lightTheme : darkTheme
}))
const { message, notification, dialog, loadingBar, modal } = createDiscreteApi(
    ['message', 'dialog', 'notification', 'loadingBar', 'modal'],
    {
        configProviderProps: configProviderPropsRef
    }
)

// dialog弹窗方法
type UseDialogOptions = {
    onOk?: () => void
    onCancel?: () => void
    onClose?: () => void
    onDestroy?: () => void
} & DialogOptions
export function useDialog(options: UseDialogOptions) {
    /**
     * @description 点击取消
     */
    function dialogCancel() {
        options.onCancel?.()
    }

    /**
     * @description 点击确认
     */
    function dialogOk() {
        options.onOk?.()
    }

    /**
     * @description 点击关闭
     */
    function dialogClose() {
        dialogReactive.destroy()
    }

    const dialogReactive = dialog.create(Object.assign({
        draggable: true,
        showIcon: false,
        closeOnEsc: false,
        maskClosable: false,
        closable: false,
        style: {
            width: '1000px'
        },
        titleStyle: {
            "border-bottom": "1px solid #dcdcdc",
            "padding-bottom": "16px",
            "font-size": "14px",
        },
        action: () => <>
            <NButton onClick={dialogCancel}>取消 </NButton>
            < NButton type="primary" onClick={dialogOk}>确认 </NButton>
        </>,
        onClose() {
            dialogReactive.destroy()
        }
    }, options, {
        title: () => <div class="w-100% flex justify-between items-center">
            <span>{options.title}</span>
            {options.closable && <i class="i-tdesign:close-circle w-24 h-24 cursor-pointer text-[#909399]" onClick={dialogClose}></i>}
        </div>
    }))

    return dialogReactive
}

/**
 * @description 带遮罩的模态框(允许为空)
 */
export function useModal(options: ModalOptions) {
    const modalReactive = modal.create({

    })
}

export {
    message,
    notification,
    dialog,
    loadingBar,
    modal
}