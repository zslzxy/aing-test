import { post } from "@/api"
import { getHeaderStoreData } from "../store"
import { message } from "@/utils/naive-tools"
import i18n from "@/lang"
import { sendLog } from "@/views/Home/controller"
import { getThirdPartyApiStoreData } from "@/views/ThirdPartyApi/store"
import { getSiderStoreData } from "@/views/Sider/store"


const $t = i18n.global.t

/**
 * @description 获取分享列表
 */
export async function getShareList() {
    const { shareHistory } = getHeaderStoreData()
    const res = await post("/share/get_share_list")
    shareHistory.value = res.message
}

/**
 * @description 创建分享
 */
export async function createShare(title: string, modelDto: any, ragList: string[], shareAgent: string | null) {
	let parameters = 'otherApi';
	let model = '';
	// 判断当前为ollama还是三方模型，从而改变参数
	try {
		if (modelDto.supplierName == 'ollama') {
			parameters = modelDto.model.split(':')[1];
			model = modelDto.model.split(':')[0];
		} else {
			model = modelDto.model;
		}

		await post('/share/create_share', {
			model,
			parameters,
			title: title ? title : $t('新分享'),
			agent_name: shareAgent,
			supplierName: modelDto.supplierName,
			rag_list: JSON.stringify(ragList),
		});
		getShareList();
		message.success($t('创建分享成功'));
	} catch (error) {
		sendLog(error as Error);
	}
}

/**
 * @description 修改分享
 */
export async function modifyShare(share_id: string, modelDto: any, title: string, ragList: string[], shareAgent: string | null) {
    const { modifyShareShow } = getHeaderStoreData()
    // const [model, parameters] = modelName.split(":")
    let parameters = "otherApi"
    let model = ""
    // 判断当前为ollama还是三方模型，从而改变参数
    try {
        if (modelDto.supplierName == "ollama") {
            parameters = modelDto.model.split(":")[1]
            model = modelDto.model.split(":")[0]
        } else {
            model = modelDto.model
				}
				await post('/share/modify_share', {
					share_id,
					model,
					parameters,
					supplierName: modelDto.supplierName,
					rag_list: JSON.stringify(ragList),
					title,
					agent_name: shareAgent,
				});
        await getShareList()
        message.success($t("修改成功"))
        modifyShareShow.value = false
    } catch (error) {
        sendLog(error as Error)
    }
}

/**
 * @description 删除分享
 */
export async function delShare(share_id: string) {
    const { delShareConfirmShow } = getHeaderStoreData()
    try {
        await post("/share/remove_share", { share_id })
        await getShareList()
        message.success("删除分享成功")
        delShareConfirmShow.value = false
    } catch (error) {
        sendLog(error as Error)
    }
}

/**
 * @description 切换模型
 */
export function changeCurrentModel(model: string, option: any) {
    const { currentModel,modelListShow } = getHeaderStoreData()
    const { currentSupplierName } = getThirdPartyApiStoreData()
    currentModel.value = model
    currentSupplierName.value = option.supplierName
    modelListShow.value = false
}

/**
 * @descript 打开侧边栏
 */
export function doExpand() {
    const { siderWidth, isFold } = getSiderStoreData()
    siderWidth.value = 220
    isFold.value = false
}

/**
 * @description 关闭弹窗
 */
export function closeShare() {
    const { shareShow, title, shareModel, shareAgent } = getHeaderStoreData();
    shareShow.value = false
    title.value = ""
		shareModel.value = ""
		shareAgent.value = null
}

/**
 * @description 修改分享
 */
export function openModifyShare(row: any) {
    const { modifyShareShow, modify_title, modify_shareModel, modify_knowledges, modify_share_id, modify_shareAgent } = getHeaderStoreData();
    modifyShareShow.value = true
    modify_title.value = row.title
    if (row.supplierName == "ollama") {
        modify_shareModel.value = `${row.model}:${row.parameters}`
    } else {
        modify_shareModel.value = row.model
    }
    modify_knowledges.value = row.rag_list
		modify_share_id.value = row.share_id
		modify_shareAgent.value = row.agent_name || null

}

/**
 * @description 关闭修改分享弹窗
 */
export function closeModifyShare() {
    const { modifyShareShow, modify_title, modify_shareModel, modify_shareAgent } = getHeaderStoreData();
    modifyShareShow.value = false
    modify_title.value = ""
		modify_shareModel.value = ""
		modify_shareAgent.value = null
}