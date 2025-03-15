import { ProductCategoryGrid } from "./product-category-grid"

export function ProductCategoriesSection() {

    const categories = [
        {
            title: "Thuốc trừ ốc",
            href: "/collections/thuoc-tru-oc-1",
            image: "https://theme.hstatic.net/200000907029/1001282128/14/img_item_category_1_master.jpg",

        },
        {
            title: "Thuốc trừ cỏ",
            href: "/collections/thuoc-tru-co",
            image: "https://theme.hstatic.net/200000907029/1001282128/14/img_item_category_2_master.jpg",

        },
        {
            title: "Thuốc trừ sâu",
            href: "/collections/thuoc-tru-sau",
            image: "https://theme.hstatic.net/200000907029/1001282128/14/img_item_category_3_master.jpg",

        },
        {
            title: "Thuốc trừ bệnh",
            href: "/collections/thuoc-tru-benh",
            image: "https://theme.hstatic.net/200000907029/1001282128/14/img_item_category_4_master.jpg",

        },
        {
            title: "Thuốc dưỡng",
            href: "/collections/thuoc-duong",
            image: "https://theme.hstatic.net/200000907029/1001282128/14/img_item_category_5_master.jpg",

        },
        {
            title: "Phân bón",
            href: "/collections/phan-bon",
            image: "https://theme.hstatic.net/200000907029/1001282128/14/img_item_category_6_master.jpg",

        },
    ]

    return (
        <section className="py-5 pb-20 px-14">

            <ProductCategoryGrid categories={categories} />

        </section>
    )
}

