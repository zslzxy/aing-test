import type { AddSupplierFormData, AddThirdPartySupplierMode, SupplierConfigInfo, SupplierModelItem, ThirdPartyApiServiceItem } from "@/views/Home/dto";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import i18n from "@/lang";
import type { SelectOption } from "naive-ui";
const { t: $t } = i18n.global;

const useThirdPartyApiStore = defineStore("thirdPartyApiStore", () => {
    // 第三方api配置弹窗
    const thirdPartyApiShow = ref(false)
    // 第三方api服务商列表
    const thirdPartyApiServiceList = ref<ThirdPartyApiServiceItem[]>([])
    // 当前选中的第三方api服务商
    const currentChooseApi = ref<ThirdPartyApiServiceItem>()
    // api服务商下的模型列表
    const supplierModelList = ref<SupplierModelItem[]>([])
    // 添加第三方api服务商下属模型弹窗
    const addSupplierModel = ref(false)
    // 添加模型的表单对象
    const addModelFormData = ref<AddThirdPartySupplierMode>({ modelName: '', capability: [], title: '' });
    // 配置模型服务商数据
    const applierServiceConfig = ref<SupplierConfigInfo>({
        baseUrl: "",
        apiKey: ""
    })
    // 是否启用了全部模型
    const isAllModelEnable = ref(false)
    // 添加模型服务商
    const addSupplierShow = ref(false)
    // 添加模型服务商表单数据
    const addSupplierFormData = ref<AddSupplierFormData>({
        supplierTitle: "",
        supplierName: "",
        baseUrl: "",
        apiKey: ""
    })
    // 是否修改模型表单数据
    const isEditModelFormData = ref(false)
    // 是否修改服务商标题
    const currentModelNameForEdiit = ref("")
    // 当前使用的服务商
    const currentSupplierName = ref("")
    // 模型标题缓存
    const modelTitTemp = ref("")
    // 添加三方服务的表单ref
    const addSupplierForm = ref()
    // 添加三方服务的表单规则
    const addSupplierFormRules = ref({
        supplierTitle: [
            {
                required: true,
                message: $t("请输入供应商名称"),
                trigger: "blur"
            }
        ],

        apiKey: [
            {
                required: true,
                message: $t("请输入API密钥"),
                trigger: "blur"
            }
        ],
        baseUrl: [
            {
                required: true,
                message: $t("请输入API地址"),
                trigger: "blur"
            }
        ]
    })
    // 添加模型的表单ref
    const addModelForm = ref()
    // 添加模型表单规则
    const addModelRules = ref({
        modelName: [
            {
                required: true,
                message: $t("请输入模型ID"),
                trigger: "blur"
            }
        ],
        title: [
            {
                required: true,
                message: $t("请输入模型别名"),
                trigger: "blur"
            }
        ],
        capability: [
            {
                required: true,
                validator(_: any, value: Array<string>, callback: any) {
                    if (value.length == 0) {
                        return callback(new Error($t("请选择模型功能")))
                    } else {
                        return callback()
                    }
                }
            }
        ]
    })
    // 嵌套模型是否可以选择
    const cantChoose = ref(false)
    // 嵌套模型选择列表
    const capabilityOptions = ref<SelectOption[]>([
        {
            label: "LLM",
            value: "llm",
            // @ts-ignore
            disabled: cantChoose
        },
        {
            label: "Vision",
            value: "vision",
            // @ts-ignore
            disabled: cantChoose
        },
        {
            label: "Embedding",
            value: "embedding"
        },
        {
            label: "Tools",
            value: "tools",
            // @ts-ignore
            disabled: cantChoose
        }
    ])
    return {
        thirdPartyApiShow,
        thirdPartyApiServiceList,
        currentChooseApi,
        supplierModelList,
        addSupplierModel,
        addModelFormData,
        applierServiceConfig,
        isAllModelEnable,
        addSupplierShow,
        addSupplierFormData,
        currentModelNameForEdiit,
        currentSupplierName,
        modelTitTemp,
        addSupplierForm,
        addSupplierFormRules,
        addModelForm,
        cantChoose,
        capabilityOptions,
        addModelRules,
        isEditModelFormData
    }
})

export function getThirdPartyApiStoreData() {
    return storeToRefs(useThirdPartyApiStore())
}